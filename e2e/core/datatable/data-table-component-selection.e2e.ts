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

import { LoginPage } from '@alfresco/adf-testing';
import { DataTablePage } from '../../pages/adf/demo-shell/dataTablePage';
import { DataTableComponentPage } from '@alfresco/adf-testing';
import { browser } from 'protractor';

import { AcsUserModel } from '../../models/ACS/acsUserModel';
import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';

describe('Datatable component - selection', () => {

    const dataTablePage = new DataTablePage();
    const loginPage = new LoginPage();
    const acsUser = new AcsUserModel();
    const navigationBarPage = new NavigationBarPage();
    const dataTableComponent = new DataTableComponentPage();

    beforeAll(async (done) => {
        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: browser.params.testConfig.adf.url
        });

        await this.alfrescoJsApi.login(browser.params.testConfig.adf.adminEmail, browser.params.testConfig.adf.adminPassword);

        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        await loginPage.loginToContentServicesUsingUserModel(acsUser);

        await navigationBarPage.navigateToDatatable();

        done();
    });

    it('[C213258] Should be possible change the selection modes when change the selectionMode property', () => {
        dataTablePage.selectRow('2');
        dataTableComponent.checkRowIsSelected('Id', '2');
        expect(dataTablePage.getNumberOfSelectedRows()).toEqual(1);
        dataTablePage.selectRow('3');
        dataTableComponent.checkRowIsSelected('Id', '3');
        expect(dataTablePage.getNumberOfSelectedRows()).toEqual(1);
        dataTablePage.selectSelectionMode('Multiple');
        dataTablePage.selectRow('1');
        dataTableComponent.checkRowIsSelected('Id', '1');
        dataTablePage.selectRowWithKeyboard('3');
        dataTableComponent.checkRowIsSelected('Id', '1');
        dataTableComponent.checkRowIsSelected('Id', '3');
        dataTablePage.checkRowIsNotSelected('2');
        dataTablePage.checkRowIsNotSelected('4');
        dataTablePage.selectSelectionMode('None');
        dataTablePage.selectRow('1');
        dataTablePage.checkNoRowIsSelected();
    });

    it('[C260059] Should be possible select multiple row when multiselect is true', () => {
        dataTablePage.clickMultiSelect();
        dataTablePage.clickCheckbox('1');
        dataTablePage.checkRowIsChecked('1');
        dataTablePage.clickCheckbox('3');
        dataTablePage.checkRowIsChecked('3');
        dataTablePage.checkRowIsNotChecked('2');
        dataTablePage.checkRowIsNotChecked('4');
        dataTablePage.clickCheckbox('3');
        dataTablePage.checkRowIsNotChecked('3');
        dataTablePage.checkRowIsChecked('1');
    });

    it('[C260058] Should be possible select all the rows when multiselect is true', () => {
        dataTablePage.checkAllRows();
        dataTablePage.checkRowIsChecked('1');
        dataTablePage.checkRowIsChecked('2');
        dataTablePage.checkRowIsChecked('3');
        dataTablePage.checkRowIsChecked('4');
    });

    it('[C277262] Should be possible reset the selected row when click on the reset button', () => {
        dataTablePage.checkRowIsChecked('1');
        dataTablePage.checkRowIsChecked('2');
        dataTablePage.checkRowIsChecked('3');
        dataTablePage.checkRowIsChecked('4');
        dataTablePage.clickReset();
        dataTablePage.checkNoRowIsSelected();
    });
});
