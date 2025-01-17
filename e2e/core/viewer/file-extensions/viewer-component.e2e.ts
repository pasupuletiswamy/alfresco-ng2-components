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

import { browser } from 'protractor';
import { LoginPage, UploadActions, StringUtil } from '@alfresco/adf-testing';
import { ViewerPage } from '../../../pages/adf/viewerPage';
import { ContentServicesPage } from '../../../pages/adf/contentServicesPage';
import CONSTANTS = require('../../../util/constants');
import resources = require('../../../util/resources');
import { FileModel } from '../../..//models/ACS/fileModel';
import { FolderModel } from '../../../models/ACS/folderModel';
import { AcsUserModel } from '../../../models/ACS/acsUserModel';
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { NavigationBarPage } from '../../..//pages/adf/navigationBarPage';

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

    const pngFileInfo = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
    });

    const otherFolderInfo = new FolderModel({
        'name': resources.Files.ADF_DOCUMENTS.OTHER_FOLDER.folder_name,
        'location': resources.Files.ADF_DOCUMENTS.OTHER_FOLDER.folder_location
    });

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
        done();
    });

    it('[C272813] Should be redirected to site when opening and closing a file in a site', async () => {
        await loginPage.loginToContentServicesUsingUserModel(acsUser);

        navigationBarPage.goToSite(site);
        contentServicesPage.checkAcsContainer();

        viewerPage.viewFile(pngFileUploaded.entry.name);

        viewerPage.checkImgViewerIsDisplayed();

        viewerPage.clickCloseButton();
    });

    describe('Other Folder Uploaded', () => {

        let uploadedOthers;
        let otherFolderUploaded;

        beforeAll(async (done) => {
            otherFolderUploaded = await uploadActions.createFolder(otherFolderInfo.name, '-my-');

            uploadedOthers = await uploadActions.uploadFolder(otherFolderInfo.location, otherFolderUploaded.entry.id);

            await loginPage.loginToContentServicesUsingUserModel(acsUser);
            contentServicesPage.goToDocumentList();

            done();
        });

        afterAll(async (done) => {
            await uploadActions.deleteFileOrFolder(otherFolderUploaded.entry.id);
            done();
        });

        it('[C280012] Should be possible to open any other Document supported extension', () => {
            contentServicesPage.doubleClickRow('other');

            uploadedOthers.forEach((currentFile) => {
                if (currentFile.entry.name !== '.DS_Store') {
                    contentServicesPage.doubleClickRow(currentFile.entry.name);
                    viewerPage.checkFileIsLoaded();
                    viewerPage.clickCloseButton();
                }
            });
        });

    });

});
