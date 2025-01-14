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

import { BrowserActions, LoginPage, UploadActions } from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { UploadDialog } from '../../pages/adf/dialog/uploadDialog';
import { UploadToggles } from '../../pages/adf/dialog/uploadToggles';
import { AcsUserModel } from '../../models/ACS/acsUserModel';
import { FileModel } from '../../models/ACS/fileModel';
import { browser } from 'protractor';
import resources = require('../../util/resources');
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { VersionManagePage } from '../../pages/adf/versionManagerPage';

describe('Upload component', () => {

    const contentServicesPage = new ContentServicesPage();
    const uploadDialog = new UploadDialog();
    const uploadToggles = new UploadToggles();
    const loginPage = new LoginPage();
    const acsUser = new AcsUserModel();
    const versionManagePage = new VersionManagePage();
    this.alfrescoJsApi = new AlfrescoApi({
        provider: 'ECM',
        hostEcm: browser.params.testConfig.adf.url
    });
    const uploadActions = new UploadActions(this.alfrescoJsApi);

    const firstPdfFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PDF_B.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PDF_B.file_location
    });
    const docxFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.DOCX.file_name,
        'location': resources.Files.ADF_DOCUMENTS.DOCX.file_location
    });
    const pdfFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PDF.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PDF.file_location
    });
    const pngFileModelTwo = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG_B.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG_B.file_location
    });
    const pngFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
    });
    const filesLocation = [pdfFileModel.location, docxFileModel.location, pngFileModel.location, firstPdfFileModel.location];
    const filesName = [pdfFileModel.name, docxFileModel.name, pngFileModel.name, firstPdfFileModel.name];

    beforeAll(async (done) => {

        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);
        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);
        await loginPage.loginToContentServicesUsingUserModel(acsUser);
        contentServicesPage.goToDocumentList();
        const pdfUploadedFile = await uploadActions.uploadFile(firstPdfFileModel.location, firstPdfFileModel.name, '-my-');
        Object.assign(firstPdfFileModel, pdfUploadedFile.entry);
        done();
    });

    beforeEach(() => {
        contentServicesPage.goToDocumentList();
    });

    afterEach(async (done) => {
        const nbResults = await contentServicesPage.numberOfResultsDisplayed();
        if (nbResults > 1) {
            const nodesPromise = await contentServicesPage.getElementsDisplayedId();

            nodesPromise.forEach(async (currentNodePromise) => {
                const nodeId = await currentNodePromise;
                await uploadActions.deleteFileOrFolder(nodeId);
            });
        }

        done();
    });

    it('[C260143] Should be possible to maximize/minimize the upload dialog', () => {
        contentServicesPage
            .uploadFile(docxFileModel.location)
            .checkContentIsDisplayed(docxFileModel.name);

        uploadDialog.fileIsUploaded(docxFileModel.name).checkCloseButtonIsDisplayed();
        expect(uploadDialog.numberOfCurrentFilesUploaded()).toEqual('1');
        expect(uploadDialog.numberOfInitialFilesUploaded()).toEqual('1');
        uploadDialog.minimizeUploadDialog().dialogIsMinimized();
        expect(uploadDialog.numberOfCurrentFilesUploaded()).toEqual('1');
        expect(uploadDialog.numberOfInitialFilesUploaded()).toEqual('1');
        uploadDialog.maximizeUploadDialog().dialogIsDisplayed().fileIsUploaded(docxFileModel.name);
        expect(uploadDialog.numberOfCurrentFilesUploaded()).toEqual('1');
        expect(uploadDialog.numberOfInitialFilesUploaded()).toEqual('1');
        uploadDialog.checkCloseButtonIsDisplayed().clickOnCloseButton().dialogIsNotDisplayed();
    });

    it('[C291902] Should be shown upload counter display in dialog box', () => {
        contentServicesPage
            .uploadFile(docxFileModel.location)
            .checkContentIsDisplayed(docxFileModel.name);

        uploadDialog.fileIsUploaded(docxFileModel.name).checkCloseButtonIsDisplayed();
        expect(uploadDialog.getTitleText()).toEqual('Uploaded 1 / 1');
        uploadDialog.checkCloseButtonIsDisplayed().clickOnCloseButton().dialogIsNotDisplayed();
    });

    it('[C260168] Should be possible to cancel upload using dialog icon', () => {
        contentServicesPage.uploadFile(pdfFileModel.location)
            .checkContentIsDisplayed(pdfFileModel.name);
        uploadDialog.removeUploadedFile(pdfFileModel.name).fileIsCancelled(pdfFileModel.name);
        expect(uploadDialog.getTitleText()).toEqual('Upload canceled');
        uploadDialog.clickOnCloseButton().dialogIsNotDisplayed();
        contentServicesPage.checkContentIsNotDisplayed(pdfFileModel.name);
    });

    it('[C260176] Should remove files from upload dialog box when closed', () => {
        contentServicesPage.uploadFile(pngFileModelTwo.location).checkContentIsDisplayed(pngFileModelTwo.name);

        uploadDialog.fileIsUploaded(pngFileModelTwo.name);
        contentServicesPage.uploadFile(pngFileModel.location).checkContentIsDisplayed(pngFileModel.name);
        uploadDialog.fileIsUploaded(pngFileModel.name).fileIsUploaded(pngFileModelTwo.name);
        uploadDialog.clickOnCloseButton().dialogIsNotDisplayed();
        contentServicesPage.uploadFile(pdfFileModel.location).checkContentIsDisplayed(pdfFileModel.name);
        uploadDialog.fileIsUploaded(pdfFileModel.name).fileIsNotDisplayedInDialog(pngFileModel.name).fileIsNotDisplayedInDialog(pngFileModelTwo.name);
        uploadDialog.clickOnCloseButton().dialogIsNotDisplayed();
    });

    it('[C260170] Should be possible to upload multiple files', () => {
        contentServicesPage.checkAcsContainer();
        uploadToggles.enableMultipleFileUpload();
        contentServicesPage.uploadMultipleFile(filesLocation).checkContentsAreDisplayed(filesName);
        uploadDialog.filesAreUploaded(filesName);
        expect(uploadDialog.getTitleText()).toEqual('Uploaded 4 / 4');
        uploadDialog.clickOnCloseButton().dialogIsNotDisplayed();
        uploadToggles.disableMultipleFileUpload();
    });

    it('[C311305] Should NOT be able to remove uploaded version', () => {
        contentServicesPage.uploadFile(docxFileModel.location);
        uploadDialog.fileIsUploaded(docxFileModel.name);
        contentServicesPage.checkContentIsDisplayed(docxFileModel.name);

        contentServicesPage.versionManagerContent(docxFileModel.name);
        BrowserActions.click(versionManagePage.showNewVersionButton);
        versionManagePage.uploadNewVersionFile(
            pngFileModel.location
        );
        versionManagePage.closeVersionDialog();
        uploadDialog.removeUploadedFile(pngFileModel.name);
        contentServicesPage.checkContentIsDisplayed(pngFileModel.name);
    });
});
