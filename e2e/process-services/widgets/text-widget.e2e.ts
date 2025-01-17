/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { AppsActions } from '../../actions/APS/apps.actions';
import { UsersActions } from '../../actions/users.actions';
import { LoginPage, BrowserActions, Widget } from '@alfresco/adf-testing';
import { TasksPage } from '../../pages/adf/process-services/tasksPage';
import CONSTANTS = require('../../util/constants');
import { browser } from 'protractor';
import resources = require('../../util/resources');

describe('Text widget', () => {

    const loginPage = new LoginPage();
    let processUserModel;
    const taskPage = new TasksPage();
    const widget = new Widget();
    let alfrescoJsApi;
    const appsActions = new AppsActions();
    let appModel;
    const app = resources.Files.WIDGET_CHECK_APP.TEXT;
    let deployedApp, process;

    beforeAll(async (done) => {
        const users = new UsersActions();

        alfrescoJsApi = new AlfrescoApi({
            provider: 'BPM',
            hostBpm: browser.params.testConfig.adf.url
        });

        await alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);

        processUserModel = await users.createTenantAndUser(alfrescoJsApi);

        await alfrescoJsApi.login(processUserModel.email, processUserModel.password);
        appModel = await appsActions.importPublishDeployApp(alfrescoJsApi, resources.Files.WIDGET_CHECK_APP.file_location);

        const appDefinitions = await alfrescoJsApi.activiti.appsApi.getAppDefinitions();
        deployedApp = appDefinitions.data.find((currentApp) => {
            return currentApp.modelId === appModel.id;
        });
        process = await appsActions.startProcess(alfrescoJsApi, appModel, app.processName);
        await loginPage.loginToProcessServicesUsingUserModel(processUserModel);
        done();
    });

    beforeEach(() => {
        const urlToNavigateTo = `${browser.params.testConfig.adf.url}/activiti/apps/${deployedApp.id}/tasks/`;
        BrowserActions.getUrl(urlToNavigateTo);
        taskPage.filtersPage().goToFilter(CONSTANTS.TASK_FILTERS.MY_TASKS);
        taskPage.formFields().checkFormIsDisplayed();
    });

    afterAll(async (done) => {
        await alfrescoJsApi.activiti.processApi.deleteProcessInstance(process.id);
        await alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        await alfrescoJsApi.activiti.adminTenantsApi.deleteTenant(processUserModel.tenantId);
        done();
    });

    it('[C268157] Should be able to set general properties for Text widget', async () => {
        const label = widget.textWidget().getFieldLabel(app.FIELD.simpleText);
        expect(label).toBe('textSimple*');
        expect(taskPage.formFields().isCompleteFormButtonDisabled()).toBeTruthy();
        const placeHolder = widget.textWidget().getFieldPlaceHolder(app.FIELD.simpleText);
        expect(placeHolder).toBe('Type something...');
        widget.textWidget().setValue(app.FIELD.simpleText, 'TEST');
        expect(taskPage.formFields().isCompleteFormButtonDisabled()).toBeFalsy();
    });

    it('[C268170] Min-max length properties', async () => {
        widget.textWidget().setValue(app.FIELD.textMinMax, 'A');
        expect(widget.textWidget().getErrorMessage(app.FIELD.textMinMax)).toBe('Enter at least 4 characters');
        expect(taskPage.formFields().isCompleteFormButtonDisabled()).toBeTruthy();
        widget.textWidget().setValue(app.FIELD.textMinMax, 'AAAAAAAAAAA');
        expect(widget.textWidget().getErrorMessage(app.FIELD.textMinMax)).toBe('Enter no more than 10 characters');
        expect(taskPage.formFields().isCompleteFormButtonDisabled()).toBeTruthy();
    });

    it('[C268171] Input mask reversed checkbox properties', async () => {
        widget.textWidget().setValue(app.FIELD.textMask, '18951523');
        expect(widget.textWidget().getFieldValue(app.FIELD.textMask)).toBe('1895-1523');
    });

    it('[C268171] Input mask reversed checkbox properties', async () => {
        widget.textWidget().setValue(app.FIELD.textMaskReversed, '1234567899');
        expect(widget.textWidget().getFieldValue(app.FIELD.textMaskReversed)).toBe('3456-7899');
    });

    it('[C268177] Should be able to set Regex Pattern property for Text widget', async () => {
        widget.textWidget().setValue(app.FIELD.simpleText, 'TEST');
        widget.textWidget().setValue(app.FIELD.textRegexp, 'T');
        expect(taskPage.formFields().isCompleteFormButtonDisabled()).toBeTruthy();
        expect(widget.textWidget().getErrorMessage(app.FIELD.textRegexp)).toBe('Enter a different value');
        widget.textWidget().setValue(app.FIELD.textRegexp, 'TE');
        expect(taskPage.formFields().isCompleteFormButtonDisabled()).toBeFalsy();
    });

    it('[C274712] Should be able to set visibility properties for Text widget ', async () => {
        widget.textWidget().isWidgetNotVisible(app.FIELD.textHidden);
        widget.textWidget().setValue(app.FIELD.showHiddenText, '1');
        widget.textWidget().isWidgetVisible(app.FIELD.textHidden);
    });
});
