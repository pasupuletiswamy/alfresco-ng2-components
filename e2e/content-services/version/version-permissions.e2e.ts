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

import { element, by } from 'protractor';

import { LoginPage, BrowserActions, UploadActions, StringUtil, NotificationHistoryPage } from '@alfresco/adf-testing';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';
import { VersionManagePage } from '../../pages/adf/versionManagerPage';
import { UploadDialog } from '../../pages/adf/dialog/uploadDialog';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { AcsUserModel } from '../../models/ACS/acsUserModel';
import { FileModel } from '../../models/ACS/fileModel';
import { browser } from 'protractor';
import resources = require('../../util/resources');
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { NodeActions } from '../../actions/ACS/node.actions';
import CONSTANTS = require('../../util/constants');

describe('Version component permissions', () => {

    const loginPage = new LoginPage();
    const versionManagePage = new VersionManagePage();
    const navigationBarPage = new NavigationBarPage();
    const uploadDialog = new UploadDialog();
    const notificationHistoryPage = new NotificationHistoryPage();
    const contentServices = new ContentServicesPage();
    let site;

    const acsUser = new AcsUserModel();
    const consumerUser = new AcsUserModel();
    const collaboratorUser = new AcsUserModel();
    const contributorUser = new AcsUserModel();
    const managerUser = new AcsUserModel();
    const fileCreatorUser = new AcsUserModel();

    const newVersionFile = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG_B.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG_B.file_location
    });

    const lockFileModel = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG_C.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG_C.file_location
    });

    const differentCreatorFile = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG_D.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG_D.file_location
    });

    this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: browser.params.testConfig.adf.url
        });
    const uploadActions = new UploadActions(this.alfrescoJsApi);
    const nodeActions = new NodeActions();

    beforeAll(async (done) => {

        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);
        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);
        await this.alfrescoJsApi.core.peopleApi.addPerson(consumerUser);
        await this.alfrescoJsApi.core.peopleApi.addPerson(collaboratorUser);
        await this.alfrescoJsApi.core.peopleApi.addPerson(contributorUser);
        await this.alfrescoJsApi.core.peopleApi.addPerson(managerUser);
        await this.alfrescoJsApi.core.peopleApi.addPerson(fileCreatorUser);

        site = await this.alfrescoJsApi.core.sitesApi.createSite({
            title: StringUtil.generateRandomString(),
            visibility: 'PUBLIC'
        });

        await this.alfrescoJsApi.core.sitesApi.addSiteMember(site.entry.id, {
            id: consumerUser.id,
            role: CONSTANTS.CS_USER_ROLES.CONSUMER
        });

        await this.alfrescoJsApi.core.sitesApi.addSiteMember(site.entry.id, {
            id: collaboratorUser.id,
            role: CONSTANTS.CS_USER_ROLES.COLLABORATOR
        });

        await this.alfrescoJsApi.core.sitesApi.addSiteMember(site.entry.id, {
            id: contributorUser.id,
            role: CONSTANTS.CS_USER_ROLES.CONTRIBUTOR
        });

        await this.alfrescoJsApi.core.sitesApi.addSiteMember(site.entry.id, {
            id: managerUser.id,
            role: CONSTANTS.CS_USER_ROLES.MANAGER
        });

        await this.alfrescoJsApi.core.sitesApi.addSiteMember(site.entry.id, {
            id: fileCreatorUser.id,
            role: CONSTANTS.CS_USER_ROLES.MANAGER
        });

        const lockFileUploaded = await uploadActions.uploadFile(lockFileModel.location, lockFileModel.name, site.entry.guid);
        Object.assign(lockFileModel, lockFileUploaded.entry);

        nodeActions.lockNode(this.alfrescoJsApi, lockFileModel.id);

        await this.alfrescoJsApi.login(fileCreatorUser.id, fileCreatorUser.password);

        await uploadActions.uploadFile(differentCreatorFile.location, differentCreatorFile.name, site.entry.guid);

        done();
    });

    describe('Manager', () => {

        const sameCreatorFile = new FileModel({
            'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
            'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
        });

        beforeAll(async (done) => {
            await this.alfrescoJsApi.login(managerUser.id, managerUser.password);

            const sameCreatorFileUploaded = await uploadActions.uploadFile(sameCreatorFile.location, sameCreatorFile.name, site.entry.guid);
            Object.assign(sameCreatorFile, sameCreatorFileUploaded.entry);

            await loginPage.loginToContentServicesUsingUserModel(managerUser);

            navigationBarPage.openContentServicesFolder(site.entry.guid);

            done();
        });

        afterAll(async (done) => {
            await this.alfrescoJsApi.nodes.deleteNode(sameCreatorFile.id);
            done();
        });

        it('[C277200] should a user with Manager permission be able to upload a new version for a file with different creator', () => {
            contentServices.versionManagerContent(differentCreatorFile.name);

            BrowserActions.click(versionManagePage.showNewVersionButton);

            versionManagePage.uploadNewVersionFile(newVersionFile.location);

            versionManagePage.checkFileVersionExist('1.1');
            expect(versionManagePage.getFileVersionName('1.1')).toEqual(newVersionFile.name);
            expect(versionManagePage.getFileVersionDate('1.1')).not.toBeUndefined();

            versionManagePage.deleteFileVersion('1.1');
            versionManagePage.clickAcceptConfirm();

            versionManagePage.checkFileVersionNotExist('1.1');

            versionManagePage.closeVersionDialog();

            uploadDialog.clickOnCloseButton();
        });

        it('[C277204] Should be disabled the option for locked file', () => {
            contentServices.getDocumentList().rightClickOnRow(lockFileModel.name);
            const actionVersion = contentServices.checkContextActionIsVisible('Manage versions');
            expect(actionVersion.isEnabled()).toBeFalsy();
        });
    });

    describe('Consumer', () => {

        beforeAll(async (done) => {
            await loginPage.loginToContentServicesUsingUserModel(consumerUser);

            navigationBarPage.openContentServicesFolder(site.entry.guid);

            done();
        });

        it('[C277197] Should a user with Consumer permission not be able to upload a new version for a file with different creator', () => {
            contentServices.versionManagerContent(differentCreatorFile.name);

            notificationHistoryPage.checkNotifyContains(`You don't have access to do this`);
        });

        it('[C277201] Should a user with Consumer permission not be able to upload a new version for a locked file', () => {
            contentServices.getDocumentList().rightClickOnRow(lockFileModel.name);
            const actionVersion = contentServices.checkContextActionIsVisible('Manage versions');
            expect(actionVersion.isEnabled()).toBeFalsy();
        });

    });

    describe('Contributor', () => {
        const sameCreatorFile = new FileModel({
            'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
            'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
        });

        beforeAll(async (done) => {
            await this.alfrescoJsApi.login(contributorUser.id, contributorUser.password);

            const sameCreatorFileUploaded = await uploadActions.uploadFile(sameCreatorFile.location, sameCreatorFile.name, site.entry.guid);
            Object.assign(sameCreatorFile, sameCreatorFileUploaded.entry);

            await loginPage.loginToContentServicesUsingUserModel(contributorUser);

            navigationBarPage.openContentServicesFolder(site.entry.guid);

            done();
        });

        afterAll(async (done) => {
            await this.alfrescoJsApi.nodes.deleteNode(sameCreatorFile.id);
            done();
        });

        it('[C277177] Should a user with Contributor permission be able to upload a new version for the created file', () => {
            contentServices.versionManagerContent(sameCreatorFile.name);

            BrowserActions.click(versionManagePage.showNewVersionButton);

            versionManagePage.uploadNewVersionFile(newVersionFile.location);

            versionManagePage.checkFileVersionExist('1.1');
            expect(versionManagePage.getFileVersionName('1.1')).toEqual(newVersionFile.name);
            expect(versionManagePage.getFileVersionDate('1.1')).not.toBeUndefined();

            versionManagePage.deleteFileVersion('1.1');
            versionManagePage.clickAcceptConfirm();

            versionManagePage.checkFileVersionNotExist('1.1');

            versionManagePage.closeVersionDialog();

            uploadDialog.clickOnCloseButton();
        });

        it('[C277198] Should a user with Contributor permission not be able to upload a new version for a file with different creator', () => {
            contentServices.versionManagerContent(differentCreatorFile.name);

            notificationHistoryPage.checkNotifyContains(`You don't have access to do this`);
        });

        it('[C277202] Should be disabled the option for a locked file', () => {
            contentServices.getDocumentList().rightClickOnRow(lockFileModel.name);
            const actionVersion = contentServices.checkContextActionIsVisible('Manage versions');
            expect(actionVersion.isEnabled()).toBeFalsy();
        });
    });

    describe('Collaborator', () => {
        const sameCreatorFile = new FileModel({
            'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
            'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
        });

        beforeAll(async (done) => {
            await this.alfrescoJsApi.login(collaboratorUser.id, collaboratorUser.password);

            const sameCreatorFileUploaded = await uploadActions.uploadFile(sameCreatorFile.location, sameCreatorFile.name, site.entry.guid);
            Object.assign(sameCreatorFile, sameCreatorFileUploaded.entry);

            await loginPage.loginToContentServicesUsingUserModel(collaboratorUser);

            navigationBarPage.openContentServicesFolder(site.entry.guid);

            done();
        });

        afterAll(async (done) => {
            await this.alfrescoJsApi.nodes.deleteNode(sameCreatorFile.id);
            done();
        });

        it('[C277195] Should a user with Collaborator permission be able to upload a new version for the created file', () => {
            contentServices.versionManagerContent(sameCreatorFile.name);

            BrowserActions.click(versionManagePage.showNewVersionButton);

            versionManagePage.uploadNewVersionFile(newVersionFile.location);

            versionManagePage.checkFileVersionExist('1.1');
            expect(versionManagePage.getFileVersionName('1.1')).toEqual(newVersionFile.name);
            expect(versionManagePage.getFileVersionDate('1.1')).not.toBeUndefined();

            versionManagePage.deleteFileVersion('1.1');
            versionManagePage.clickAcceptConfirm();

            versionManagePage.checkFileVersionNotExist('1.1');

            versionManagePage.closeVersionDialog();

            uploadDialog.clickOnCloseButton();
        });

        it('[C277199] should a user with Collaborator permission be able to upload a new version for a file with different creator', () => {
            contentServices.versionManagerContent(differentCreatorFile.name);

            BrowserActions.click(versionManagePage.showNewVersionButton);

            versionManagePage.uploadNewVersionFile(newVersionFile.location);

            versionManagePage.checkFileVersionExist('1.1');
            expect(versionManagePage.getFileVersionName('1.1')).toEqual(newVersionFile.name);
            expect(versionManagePage.getFileVersionDate('1.1')).not.toBeUndefined();

            versionManagePage.clickActionButton('1.1');

            expect(element(by.css(`[id="adf-version-list-action-delete-1.1"]`)).isEnabled()).toBe(false);

            versionManagePage.closeActionsMenu();

            versionManagePage.closeVersionDialog();
        });

        it('[C277203] Should a user with Collaborator permission not be able to upload a new version for a locked file', () => {
            contentServices.getDocumentList().rightClickOnRow(lockFileModel.name);
            const actionVersion = contentServices.checkContextActionIsVisible('Manage versions');
            expect(actionVersion.isEnabled()).toBeFalsy();
        });
    });

});
