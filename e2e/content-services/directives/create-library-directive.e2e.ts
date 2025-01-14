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

import { LoginPage, BrowserActions } from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { CreateLibraryDialog } from '../../pages/adf/dialog/createLibraryDialog';
import { CustomSources } from '../../pages/adf/demo-shell/customSourcesPage';

import { AcsUserModel } from '../../models/ACS/acsUserModel';
import { browser } from 'protractor';
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { StringUtil } from '@alfresco/adf-testing';

describe('Create library directive', function () {

    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    const createLibraryDialog = new CreateLibraryDialog();
    const customSourcesPage = new CustomSources();

    const visibility = {
        public: 'Public',
        private: 'Private',
        moderated: 'Moderated'
    };

    let createSite;

    const acsUser = new AcsUserModel();

    beforeAll(async (done) => {
        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: browser.params.testConfig.adf.url
        });

        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);

        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        await loginPage.loginToContentServicesUsingUserModel(acsUser);

        createSite = await this.alfrescoJsApi.core.sitesApi.createSite({
            'title': StringUtil.generateRandomString(20).toLowerCase(),
            'visibility': 'PUBLIC'
        });

        done();
    });

    beforeEach((done) => {
        contentServicesPage.goToDocumentList();
        contentServicesPage.openCreateLibraryDialog();
        done();
    });

    afterEach(() => {
        BrowserActions.closeMenuAndDialogs();
    });

    it('[C290158] Should display the Create Library defaults', () => {
        expect(createLibraryDialog.getTitle()).toMatch('Create Library');
        expect(createLibraryDialog.isNameDisplayed()).toBe(true, 'Name input field is not displayed');
        expect(createLibraryDialog.isLibraryIdDisplayed()).toBe(true, 'Library ID field is not displayed');
        expect(createLibraryDialog.isDescriptionDisplayed()).toBe(true, 'Library description is not displayed');
        expect(createLibraryDialog.isPublicDisplayed()).toBe(true, 'Public radio button is not displayed');
        expect(createLibraryDialog.isPrivateDisplayed()).toBe(true, 'Private radio button is not displayed');
        expect(createLibraryDialog.isModeratedDisplayed()).toBe(true, 'Moderated radio button is not displayed');
        expect(createLibraryDialog.isCreateEnabled()).toBe(false, 'Create button is not disabled');
        expect(createLibraryDialog.isCancelEnabled()).toBe(true, 'Cancel button is disabled');
        expect(createLibraryDialog.getSelectedRadio()).toMatch(visibility.public, 'The default visibility is not public');
    });

    it('[C290159] Should close the dialog when clicking Cancel button', () => {
        const libraryName = 'cancelLibrary';

        createLibraryDialog.typeLibraryName(libraryName);

        createLibraryDialog.clickCancel();

        createLibraryDialog.waitForDialogToClose();
    });

    it('[C290160] Should create a public library', () => {
        const libraryName = StringUtil.generateRandomString();
        const libraryDescription = StringUtil.generateRandomString();
        createLibraryDialog.typeLibraryName(libraryName);
        createLibraryDialog.typeLibraryDescription(libraryDescription);
        createLibraryDialog.selectPublic();

        expect(createLibraryDialog.getSelectedRadio()).toMatch(visibility.public, 'The visibility is not public');

        createLibraryDialog.clickCreate();
        createLibraryDialog.waitForDialogToClose();

        expect(createLibraryDialog.isDialogOpen()).not.toBe(true, 'The Create Library dialog is not closed');

        customSourcesPage.navigateToCustomSources();
        customSourcesPage.selectMySitesSourceType();
        customSourcesPage.checkRowIsDisplayed(libraryName);

        expect(customSourcesPage.getStatusCell(libraryName)).toMatch('PUBLIC', 'Wrong library status.');
    });

    it('[C290173] Should create a private library', () => {
        const libraryName = StringUtil.generateRandomString();
        const libraryDescription = StringUtil.generateRandomString();
        createLibraryDialog.typeLibraryName(libraryName);
        createLibraryDialog.typeLibraryDescription(libraryDescription);
        createLibraryDialog.selectPrivate();

        expect(createLibraryDialog.getSelectedRadio()).toMatch(visibility.private, 'The visibility is not private');

        createLibraryDialog.clickCreate();
        createLibraryDialog.waitForDialogToClose();

        expect(createLibraryDialog.isDialogOpen()).not.toBe(true, 'The Create Library dialog is not closed');

        customSourcesPage.navigateToCustomSources();
        customSourcesPage.selectMySitesSourceType();
        customSourcesPage.checkRowIsDisplayed(libraryName);

        expect(customSourcesPage.getStatusCell(libraryName)).toMatch('PRIVATE', 'Wrong library status.');
    });

    it('[C290174, C290175] Should create a moderated library with a given Library ID', () => {
        const libraryName = StringUtil.generateRandomString();
        const libraryId = StringUtil.generateRandomString();
        const libraryDescription = StringUtil.generateRandomString();
        createLibraryDialog.typeLibraryName(libraryName);
        createLibraryDialog.typeLibraryId(libraryId);
        createLibraryDialog.typeLibraryDescription(libraryDescription);
        createLibraryDialog.selectModerated();

        expect(createLibraryDialog.getSelectedRadio()).toMatch(visibility.moderated, 'The visibility is not moderated');

        createLibraryDialog.clickCreate();
        createLibraryDialog.waitForDialogToClose();

        expect(createLibraryDialog.isDialogOpen()).not.toBe(true, 'The Create Library dialog is not closed');

        customSourcesPage.navigateToCustomSources();
        customSourcesPage.selectMySitesSourceType();
        customSourcesPage.checkRowIsDisplayed(libraryName);

        expect(customSourcesPage.getStatusCell(libraryName)).toMatch('MODERATED', 'Wrong library status.');
    });

    it('[C290163] Should disable Create button when a mandatory field is not filled in', () => {
        const inputValue = StringUtil.generateRandomString();

        createLibraryDialog.typeLibraryName(inputValue);
        createLibraryDialog.clearLibraryId();
        expect(createLibraryDialog.isCreateEnabled()).not.toBe(true, 'The Create button is enabled');
        createLibraryDialog.clearLibraryName();

        createLibraryDialog.typeLibraryId(inputValue);
        expect(createLibraryDialog.isCreateEnabled()).not.toBe(true, 'The Create button is enabled');
        createLibraryDialog.clearLibraryId();

        createLibraryDialog.typeLibraryDescription(inputValue);
        expect(createLibraryDialog.isCreateEnabled()).not.toBe(true, 'The Create button is enabled');
    });

    it('[C290164] Should auto-fill in the Library Id built from library name', () => {
        const name: string[] = ['abcd1234', 'ab cd 12 34', 'ab cd&12+34_@link/*'];
        const libraryId: string[] = ['abcd1234', 'ab-cd-12-34', 'ab-cd1234link'];

        for (let _i = 0; _i < 3; _i++) {
            createLibraryDialog.typeLibraryName(name[_i]);
            expect(createLibraryDialog.getLibraryIdText()).toMatch(libraryId[_i]);
            createLibraryDialog.clearLibraryName();
        }
    });

    it('[C290176] Should not accept special characters for Library Id', () => {
        const name = 'My Library';
        const libraryId: string[] = ['My New Library', 'My+New+Library123!', '<>'];

        createLibraryDialog.typeLibraryName(name);

        for (let _i = 0; _i < 3; _i++) {
            createLibraryDialog.typeLibraryId(libraryId[_i]);
            expect(createLibraryDialog.isErrorMessageDisplayed()).toBe(true, 'Error message is not displayed');
            expect(createLibraryDialog.getErrorMessage()).toMatch('Use numbers and letters only');
        }
    });

    it('[C291985] Should not accept less than one character name for Library name', () => {
        const name = 'x';
        const libraryId = 'My New Library';

        createLibraryDialog.typeLibraryName(name);
        createLibraryDialog.typeLibraryId(libraryId);
        expect(createLibraryDialog.isErrorMessageDisplayed()).toBe(true, 'Error message is not displayed');
        expect(createLibraryDialog.getErrorMessage()).toMatch('Title must be at least 2 characters long');
    });

    it('[C291793] Should display error for Name field filled in with spaces only', () => {
        const name = '    ';
        const libraryId = StringUtil.generateRandomString();

        createLibraryDialog.typeLibraryName(name);
        createLibraryDialog.typeLibraryId(libraryId);

        expect(createLibraryDialog.isErrorMessageDisplayed()).toBe(true, 'Error message is not displayed');
        expect(createLibraryDialog.getErrorMessage()).toMatch("Library name can't contain only spaces");
    });

    it('[C290177] Should not accept a duplicate Library Id', () => {
        const name = 'My Library';
        const libraryId = StringUtil.generateRandomString();

        createLibraryDialog.typeLibraryName(name);
        createLibraryDialog.typeLibraryId(libraryId);
        createLibraryDialog.clickCreate();
        createLibraryDialog.waitForDialogToClose();

        contentServicesPage.openCreateLibraryDialog();

        createLibraryDialog.typeLibraryName(name);
        createLibraryDialog.typeLibraryId(libraryId);
        expect(createLibraryDialog.isErrorMessageDisplayed()).toBe(true, 'Error message is not displayed');
        expect(createLibraryDialog.getErrorMessage()).toMatch("This Library ID isn't available. Try a different Library ID.");
    });

    it('[C290178] Should accept the same library name but different Library Ids', () => {
        const name = createSite.entry.title;
        const libraryId = StringUtil.generateRandomString();

        createLibraryDialog.typeLibraryName(name.toUpperCase());
        createLibraryDialog.typeLibraryId(libraryId);

        createLibraryDialog.waitForLibraryNameHint();
        expect(createLibraryDialog.getLibraryNameHint()).toMatch('Library name already in use', 'The library name hint is wrong');

        createLibraryDialog.clickCreate();
        createLibraryDialog.waitForDialogToClose();

        expect(createLibraryDialog.isDialogOpen()).not.toBe(true, 'The Create library dialog remained open');
    });

    it('[C290179] Should not accept more than the expected characters for input fields', () => {
        const name = StringUtil.generateRandomString(257);
        const libraryId = StringUtil.generateRandomString(73);
        const libraryDescription = StringUtil.generateRandomString(513);

        createLibraryDialog.typeLibraryName(name);
        createLibraryDialog.typeLibraryId(libraryId);
        createLibraryDialog.typeLibraryDescription(libraryDescription);

        createLibraryDialog.selectPublic();

        expect(createLibraryDialog.getErrorMessages(0)).toMatch('Use 256 characters or less for title');
        expect(createLibraryDialog.getErrorMessages(1)).toMatch('Use 72 characters or less for the URL name');
        expect(createLibraryDialog.getErrorMessages(2)).toMatch('Use 512 characters or less for description');
    });
});
