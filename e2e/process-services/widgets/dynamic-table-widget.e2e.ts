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

describe('Dynamic Table widget ', () => {

    const loginPage = new LoginPage();
    let processUserModel;
    const taskPage = new TasksPage();
    const widget = new Widget();
    let alfrescoJsApi;
    const appsActions = new AppsActions();
    let appModel;
    let deployedApp, process;

    describe('with Date Time Widget App', () => {
        const app = resources.Files.WIDGET_CHECK_APP.DYNAMIC_TABLE;

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

        it('[C276729] Should be possible to set visibility properties for Dynamic Table', () => {
            taskPage.formFields().checkWidgetIsHidden(app.FIELD.dynamic_table_age_id);
            widget.checkboxWidget().clickCheckboxInput(app.FIELD.checkbox_id);
            taskPage.formFields().checkWidgetIsVisible(app.FIELD.dynamic_table_age_id);
        });

        it('[C279349] Should be able to have a Date Time widget in a Dynamic Table widget', () => {
            widget.dynamicTable().clickAddButton();
            widget.dateTimeWidget().openDatepicker(app.FIELD.dateTime_input_id);
            widget.dateTimeWidget().selectDay('10');
            widget.dateTimeWidget().selectHour('8');
            widget.dateTimeWidget().selectMinute('30');
            widget.dateTimeWidget().clearDateTimeInput(app.FIELD.dateTime_input_id);

            widget.dynamicTable().clickSaveButton();
            widget.dynamicTable().getTableRow(0);
        });
    });

    describe('with People Widget App', () => {

        const app = resources.Files.WIDGET_CHECK_APP.DYNAMIC_TABLE_USERS;

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

        it('[C260407] Should be able to add/delete/update row in Dynamic Table widget', () => {

            widget.dynamicTable().clickAddRow();
            widget.dynamicTable().setDatatableInput('User1');
            widget.dynamicTable().clickSaveButton();
            expect(widget.dynamicTable().getTableRowText(0)).toEqual('User1');

            widget.dynamicTable().clickTableRow(0);
            widget.dynamicTable().clickEditButton();
            widget.dynamicTable().setDatatableInput('User2');
            widget.dynamicTable().clickCancelButton();
            expect(widget.dynamicTable().getTableRowText(0)).toEqual('User1');

            widget.dynamicTable().clickEditButton();
            widget.dynamicTable().setDatatableInput('User2');
            widget.dynamicTable().clickSaveButton();
            expect(widget.dynamicTable().getTableRowText(0)).toEqual('User2');

            widget.dynamicTable().clickAddRow();
            widget.dynamicTable().setDatatableInput('User3');
            widget.dynamicTable().clickCancelButton();
            widget.dynamicTable().checkTableRowIsNotVisible(1);
        });
    });

});
