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

import { LoginPage, UploadActions, StringUtil, BrowserActions } from '@alfresco/adf-testing';
import { ViewerPage } from '../../pages/adf/viewerPage';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { ShareDialog } from '../../pages/adf/dialog/shareDialog';
import CONSTANTS = require('../../util/constants');
import resources = require('../../util/resources');
import { FileModel } from '../../models/ACS/fileModel';
import { AcsUserModel } from '../../models/ACS/acsUserModel';
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { browser } from 'protractor';

describe('Viewer', () => {

    const viewerPage = new ViewerPage();
    const navigationBarPage = new NavigationBarPage();
    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: browser.params.testConfig.adf.url
        });
    const uploadActions = new UploadActions(this.alfrescoJsApi);
    let site;
    const acsUser = new AcsUserModel();
    let pngFileUploaded;
    const contentList = contentServicesPage.getDocumentList();
    const shareDialog = new ShareDialog();

    const pngFileInfo = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
    });

    const wordFileInfo = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.DOCX_SUPPORTED.file_name,
        'location': resources.Files.ADF_DOCUMENTS.DOCX_SUPPORTED.file_location
    });

    let pngFileShared, wordFileUploaded;

    beforeAll(async (done) => {
        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        site = await this.alfrescoJsApi.core.sitesApi.createSite({
            title: StringUtil.generateRandomString(8),
            visibility: 'PUBLIC'
        });

        await this.alfrescoJsApi.core.sitesApi.addSiteMember(site.entry.id, {
            id: acsUser.id,
            role: CONSTANTS.CS_USER_ROLES.MANAGER
        });

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        pngFileUploaded = await uploadActions.uploadFile(pngFileInfo.location, pngFileInfo.name, site.entry.guid);

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        wordFileUploaded = await uploadActions.uploadFile(wordFileInfo.location, wordFileInfo.name, '-my-');

        pngFileShared = await this.alfrescoJsApi.core.sharedlinksApi.addSharedLink({ 'nodeId': pngFileUploaded.entry.id });

        done();
    });

    afterAll(async (done) => {
        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);
        await uploadActions.deleteFileOrFolder(wordFileUploaded.entry.id);
        done();
    });

    beforeEach(async () => {
        await loginPage.loginToContentServicesUsingUserModel(acsUser);
    });

    it('[C260105] Should be able to open an image file shared via API', () => {
        BrowserActions.getUrl(browser.params.testConfig.adf.url + '/preview/s/' + pngFileShared.entry.id);
        viewerPage.checkImgContainerIsDisplayed();
        BrowserActions.getUrl(browser.params.testConfig.adf.url);
        navigationBarPage.clickLogoutButton();
        BrowserActions.getUrl(browser.params.testConfig.adf.url + '/preview/s/' + pngFileShared.entry.id);
        viewerPage.checkImgContainerIsDisplayed();
    });

    it('[C260106] Should be able to open a Word file shared via API', () => {
        navigationBarPage.clickContentServicesButton();
        contentServicesPage.waitForTableBody();

        contentList.selectRow(wordFileInfo.name);
        contentServicesPage.clickShareButton();
        shareDialog.checkDialogIsDisplayed();
        shareDialog.clickShareLinkButton();
        browser.controlFlow().execute(async () => {
            const sharedLink = await shareDialog.getShareLink();

            await BrowserActions.getUrl(sharedLink);
            viewerPage.checkFileIsLoaded();
            viewerPage.checkFileNameIsDisplayed(wordFileInfo.name);

            await BrowserActions.getUrl(browser.params.testConfig.adf.url);
            navigationBarPage.clickLogoutButton();
            await BrowserActions.getUrl(sharedLink);
            viewerPage.checkFileIsLoaded();
            viewerPage.checkFileNameIsDisplayed(wordFileInfo.name);
        });
    });
});
