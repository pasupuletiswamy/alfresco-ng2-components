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

import { NavigationBarPage } from '../pages/adf/navigationBarPage';
import { PeopleGroupCloudComponentPage } from '../pages/adf/demo-shell/process-services/peopleGroupCloudComponentPage';
import { GroupCloudComponentPage, PeopleCloudComponentPage, SettingsPage } from '@alfresco/adf-testing';
import { browser } from 'protractor';
import { LoginSSOPage, IdentityService, GroupIdentityService, RolesService, ApiService } from '@alfresco/adf-testing';
import resources = require('../util/resources');

describe('People Groups Cloud Component', () => {

    describe('People Groups Cloud Component', () => {
        const loginSSOPage = new LoginSSOPage();
        const navigationBarPage = new NavigationBarPage();
        const peopleGroupCloudComponentPage = new PeopleGroupCloudComponentPage();
        const peopleCloudComponent = new PeopleCloudComponentPage();
        const groupCloudComponentPage = new GroupCloudComponentPage();
        let identityService: IdentityService;
        let groupIdentityService: GroupIdentityService;
        let rolesService: RolesService;
        const settingsPage = new SettingsPage();
        const apiService = new ApiService(
            browser.params.config.oauth2.clientId,
            browser.params.config.bpmHost, browser.params.config.oauth2.host, browser.params.config.providers
        );

        let apsUser, testUser;
        let activitiUser;
        let noRoleUser;
        let groupAps;
        let groupActiviti;
        let groupNoRole;
        let apsUserRoleId;
        let apsAdminRoleId;
        let activitiAdminRoleId;
        let clientActivitiAdminRoleId, clientActivitiUserRoleId;
        let users = [];
        let groups = [];
        let clientId;

        beforeAll(async (done) => {

            await apiService.login(browser.params.identityAdmin.email, browser.params.identityAdmin.password);

            identityService = new IdentityService(apiService);
            rolesService = new RolesService(apiService);
            groupIdentityService = new GroupIdentityService(apiService);
            clientId = await groupIdentityService.getClientIdByApplicationName(resources.ACTIVITI7_APPS.SIMPLE_APP.name);
            groupActiviti = await groupIdentityService.createIdentityGroup();
            clientActivitiAdminRoleId = await rolesService.getClientRoleIdByRoleName(groupActiviti.id, clientId, identityService.ROLES.ACTIVITI_ADMIN);
            clientActivitiUserRoleId = await rolesService.getClientRoleIdByRoleName(groupActiviti.id, clientId, identityService.ROLES.ACTIVITI_USER);

            testUser = await identityService.createIdentityUserWithRole(apiService, [identityService.ROLES.APS_USER]);
            apsUser = await identityService.createIdentityUserWithRole(apiService, [identityService.ROLES.APS_USER]);
            activitiUser = await identityService.createIdentityUserWithRole(apiService, [identityService.ROLES.ACTIVITI_USER]);
            noRoleUser = await identityService.createIdentityUser();
            await identityService.deleteClientRole(noRoleUser.idIdentityService, clientId, clientActivitiAdminRoleId, identityService.ROLES.ACTIVITI_ADMIN);
            await identityService.deleteClientRole(noRoleUser.idIdentityService, clientId, clientActivitiUserRoleId, identityService.ROLES.ACTIVITI_USER);

            groupAps = await groupIdentityService.createIdentityGroup();
            apsAdminRoleId = await rolesService.getRoleIdByRoleName(identityService.ROLES.APS_ADMIN);
            apsUserRoleId = await rolesService.getRoleIdByRoleName(identityService.ROLES.APS_USER);
            await groupIdentityService.assignRole(groupAps.id, apsAdminRoleId, identityService.ROLES.APS_ADMIN);
            await groupIdentityService.assignRole(groupAps.id, apsUserRoleId, identityService.ROLES.APS_USER);
            activitiAdminRoleId = await rolesService.getRoleIdByRoleName(identityService.ROLES.ACTIVITI_ADMIN);
            await groupIdentityService.assignRole(groupActiviti.id, activitiAdminRoleId, identityService.ROLES.ACTIVITI_ADMIN);
            groupNoRole = await groupIdentityService.createIdentityGroup();

            await groupIdentityService.addClientRole(groupAps.id, clientId, clientActivitiAdminRoleId, identityService.ROLES.ACTIVITI_ADMIN);
            await groupIdentityService.addClientRole(groupActiviti.id, clientId, clientActivitiAdminRoleId, identityService.ROLES.ACTIVITI_ADMIN);
            users = [`${apsUser.idIdentityService}`, `${activitiUser.idIdentityService}`, `${noRoleUser.idIdentityService}`, `${testUser.idIdentityService}`];
            groups = [`${groupAps.id}`, `${groupActiviti.id}`, `${groupNoRole.id}`];

            await settingsPage.setProviderBpmSso(
                browser.params.config.bpmHost,
                browser.params.config.oauth2.host,
                browser.params.config.identityHost);
            loginSSOPage.loginSSOIdentityService(testUser.email, testUser.password);
            done();
        });

        afterAll(async (done) => {
            await apiService.login(browser.params.identityAdmin.email, browser.params.identityAdmin.password);
            for (let i = 0; i < users.length; i++) {
                await identityService.deleteIdentityUser(users[i]);
            }
            for (let i = 0; i < groups.length; i++) {
                await groupIdentityService.deleteIdentityGroup(groups[i]);
            }
            done();
        });

        beforeEach(() => {
            navigationBarPage.navigateToPeopleGroupCloudPage();
            peopleGroupCloudComponentPage.checkGroupsCloudComponentTitleIsDisplayed();
            peopleGroupCloudComponentPage.checkPeopleCloudComponentTitleIsDisplayed();
        });

        afterEach(async () => {
            await browser.refresh();
        });

        describe('[C297674] Should be able to add filtering to People Cloud Component', () => {

            beforeEach(() => {
                peopleGroupCloudComponentPage.clickPeopleCloudMultipleSelection();
                peopleGroupCloudComponentPage.checkPeopleCloudMultipleSelectionIsSelected();
                peopleGroupCloudComponentPage.clickPeopleCloudFilterRole();
                peopleGroupCloudComponentPage.checkPeopleCloudFilterRole();
            });

            it('No role filtering', () => {
                peopleCloudComponent.searchAssignee(noRoleUser.lastName);
                peopleCloudComponent.checkUserIsDisplayed(`${noRoleUser.firstName} ${noRoleUser.lastName}`);
                peopleCloudComponent.searchAssignee(apsUser.lastName);
                peopleCloudComponent.checkUserIsDisplayed(`${apsUser.firstName} ${apsUser.lastName}`);
                peopleCloudComponent.searchAssignee(activitiUser.lastName);
                peopleCloudComponent.checkUserIsDisplayed(`${activitiUser.firstName} ${activitiUser.lastName}`);
            });

            it('One role filtering', () => {
                peopleGroupCloudComponentPage.enterPeopleRoles(`["${identityService.ROLES.APS_USER}"]`);
                peopleCloudComponent.searchAssignee(apsUser.lastName);
                peopleCloudComponent.checkUserIsDisplayed(`${apsUser.firstName} ${apsUser.lastName}`);
                peopleCloudComponent.searchAssignee(activitiUser.lastName);
                peopleCloudComponent.checkUserIsNotDisplayed(`${activitiUser.firstName} ${activitiUser.lastName}`);
                peopleCloudComponent.searchAssignee(noRoleUser.lastName);
                peopleCloudComponent.checkUserIsNotDisplayed(`${noRoleUser.firstName} ${noRoleUser.lastName}`);
            });

            it('Multiple roles filtering', () => {
                peopleGroupCloudComponentPage.enterPeopleRoles(`["${identityService.ROLES.APS_USER}", "${identityService.ROLES.ACTIVITI_USER}"]`);
                peopleCloudComponent.searchAssignee(apsUser.lastName);
                peopleCloudComponent.checkUserIsDisplayed(`${apsUser.firstName} ${apsUser.lastName}`);
                peopleCloudComponent.searchAssignee(activitiUser.lastName);
                peopleCloudComponent.checkUserIsDisplayed(`${activitiUser.firstName} ${activitiUser.lastName}`);
                peopleCloudComponent.searchAssignee(noRoleUser.lastName);
                peopleCloudComponent.checkUserIsNotDisplayed(`${noRoleUser.firstName} ${noRoleUser.lastName}`);
            });
        });

        describe('[C309674] Should be able to add filtering to Group Cloud Component', () => {

            beforeEach(() => {
                peopleGroupCloudComponentPage.clickGroupCloudMultipleSelection();
                peopleGroupCloudComponentPage.clickGroupCloudFilterRole();
            });

            it('No role filtering', () => {
                peopleGroupCloudComponentPage.clearField(peopleGroupCloudComponentPage.groupRoleInput);
                groupCloudComponentPage.searchGroups(groupNoRole.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupNoRole.name);
                groupCloudComponentPage.searchGroups(groupActiviti.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupActiviti.name);
                groupCloudComponentPage.searchGroups(groupAps.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupAps.name);
            });

            it('One role filtering', () => {
                peopleGroupCloudComponentPage.enterGroupRoles(`["${identityService.ROLES.APS_ADMIN}"]`);
                groupCloudComponentPage.searchGroups(groupAps.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupAps.name);
                groupCloudComponentPage.searchGroups(groupActiviti.name);
                groupCloudComponentPage.checkGroupIsNotDisplayed(groupActiviti.name);
                groupCloudComponentPage.searchGroups(groupNoRole.name);
                groupCloudComponentPage.checkGroupIsNotDisplayed(groupNoRole.name);
            });

            it('[C309996] Should be able to filter groups based on composite roles Activit_Admin', () => {
                peopleGroupCloudComponentPage.enterGroupRoles(`["${identityService.ROLES.ACTIVITI_ADMIN}"]`);
                groupCloudComponentPage.searchGroups(groupActiviti.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupActiviti.name);
                groupCloudComponentPage.searchGroups(groupNoRole.name);
                groupCloudComponentPage.checkGroupIsNotDisplayed(groupNoRole.name);
                groupCloudComponentPage.searchGroups(groupAps.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupAps.name);
            });

            it('[C309996] Should be able to filter groups based on composite roles Aps_User', () => {
                peopleGroupCloudComponentPage.enterGroupRoles(`["${identityService.ROLES.APS_USER}"]`);
                groupCloudComponentPage.searchGroups(groupActiviti.name);
                groupCloudComponentPage.checkGroupIsNotDisplayed(groupActiviti.name);
                groupCloudComponentPage.searchGroups(groupNoRole.name);
                groupCloudComponentPage.checkGroupIsNotDisplayed(groupNoRole.name);
                groupCloudComponentPage.searchGroups(groupAps.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupAps.name);
            });

            it('[C309996] Should be able to filter groups based on composite roles Activiti_User', () => {
                peopleGroupCloudComponentPage.enterGroupRoles(`["${identityService.ROLES.ACTIVITI_USER}"]`);
                groupCloudComponentPage.searchGroups(groupActiviti.name);
                groupCloudComponentPage.checkGroupIsNotDisplayed(groupActiviti.name);
                groupCloudComponentPage.searchGroups(groupNoRole.name);
                groupCloudComponentPage.checkGroupIsNotDisplayed(groupNoRole.name);
                groupCloudComponentPage.searchGroups(groupAps.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupAps.name);
            });

            it('Multiple roles filtering', () => {
                peopleGroupCloudComponentPage.enterGroupRoles(`["${identityService.ROLES.APS_ADMIN}", "${identityService.ROLES.ACTIVITI_ADMIN}"]`);
                groupCloudComponentPage.searchGroups(groupActiviti.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupActiviti.name);
                groupCloudComponentPage.searchGroups(groupAps.name);
                groupCloudComponentPage.checkGroupIsDisplayed(groupAps.name);
                groupCloudComponentPage.searchGroups(groupNoRole.name);
                groupCloudComponentPage.checkGroupIsNotDisplayed(groupNoRole.name);
            });
        });

        it('[C305033] Should fetch the preselect users based on the Validate flag set to True in Single mode selection', () => {

            peopleGroupCloudComponentPage.clickPeopleCloudSingleSelection();
            peopleGroupCloudComponentPage.checkPeopleCloudSingleSelectionIsSelected();
            peopleGroupCloudComponentPage.clickPreselectValidation();
            expect(peopleGroupCloudComponentPage.getPreselectValidationStatus()).toBe('true');

            peopleGroupCloudComponentPage.enterPeoplePreselect('[{"id":"12345","username":"someUsername","email":"someEmail"}]');
            expect(peopleCloudComponent.getAssigneeFieldContent()).toBe('');

            expect(peopleGroupCloudComponentPage.getPreselectValidationStatus()).toBe('true');
            peopleGroupCloudComponentPage.enterPeoplePreselect(`[{"id":"${noRoleUser.idIdentityService}"}]`);
            expect(peopleCloudComponent.getAssigneeFieldContent()).toBe(`${noRoleUser.firstName} ${noRoleUser.lastName}`);

            peopleGroupCloudComponentPage.enterPeoplePreselect(`[{"email":"${apsUser.email}"}]`);
            expect(peopleCloudComponent.getAssigneeFieldContent()).toBe(`${apsUser.firstName} ${apsUser.lastName}`);

            peopleGroupCloudComponentPage.enterPeoplePreselect(`[{"username":"${activitiUser.username}"}]`);
            expect(peopleCloudComponent.getAssigneeFieldContent()).toBe(`${activitiUser.firstName} ${activitiUser.lastName}`);
        });

        it('[C309676] Should fetch the preselect users based on the Validate flag set to True in Multiple mode selection', () => {

            peopleGroupCloudComponentPage.clickPeopleCloudMultipleSelection();
            peopleGroupCloudComponentPage.checkPeopleCloudMultipleSelectionIsSelected();
            peopleGroupCloudComponentPage.clickPreselectValidation();
            expect(peopleGroupCloudComponentPage.getPreselectValidationStatus()).toBe('true');

            peopleGroupCloudComponentPage.enterPeoplePreselect(`[{"id":"${apsUser.idIdentityService}"},{"id":"${activitiUser.idIdentityService}"},` +
                `{"id":"${noRoleUser.idIdentityService}"}]`);
            peopleCloudComponent.checkSelectedPeople(`${apsUser.firstName} ${apsUser.lastName}`);
            peopleCloudComponent.checkSelectedPeople(`${activitiUser.firstName} ${activitiUser.lastName}`);
            peopleCloudComponent.checkSelectedPeople(`${noRoleUser.firstName} ${noRoleUser.lastName}`);

            peopleGroupCloudComponentPage.enterPeoplePreselect(`[{"email":"${apsUser.email}"},{"email":"${activitiUser.email}"},{"email":"${noRoleUser.email}"}]`);
            peopleCloudComponent.checkSelectedPeople(`${apsUser.firstName} ${apsUser.lastName}`);
            peopleCloudComponent.checkSelectedPeople(`${activitiUser.firstName} ${activitiUser.lastName}`);
            peopleCloudComponent.checkSelectedPeople(`${noRoleUser.firstName} ${noRoleUser.lastName}`);

            peopleGroupCloudComponentPage.enterPeoplePreselect(`[{"username":"${apsUser.username}"},{"username":"${activitiUser.username}"},` +
                `{"username":"${noRoleUser.username}"}]`);
            peopleCloudComponent.checkSelectedPeople(`${apsUser.firstName} ${apsUser.lastName}`);
            peopleCloudComponent.checkSelectedPeople(`${activitiUser.firstName} ${activitiUser.lastName}`);
            peopleCloudComponent.checkSelectedPeople(`${noRoleUser.firstName} ${noRoleUser.lastName}`);

            peopleCloudComponent.searchAssigneeToExisting(noRoleUser.lastName);
            peopleCloudComponent.checkUserIsNotDisplayed(`${noRoleUser.firstName} ${noRoleUser.lastName}`);

        });

        it('[C309677] Should populate the Users without any validation when the Preselect flag is set to false', () => {
            peopleGroupCloudComponentPage.clickPeopleCloudMultipleSelection();
            peopleGroupCloudComponentPage.checkPeopleCloudMultipleSelectionIsSelected();
            expect(peopleGroupCloudComponentPage.getPreselectValidationStatus()).toBe('false');

            peopleGroupCloudComponentPage.enterPeoplePreselect(
                `[{"id":"TestId1","firstName":"TestFirstName1","lastName":"TestLastName1"},` +
                `{"id":"TestId2","firstName":"TestFirstName2","lastName":"TestLastName2"},` +
                `{"id":"TestId3","firstName":"TestFirstName3","lastName":"TestLastName3"}]`);
            peopleCloudComponent.checkSelectedPeople('TestFirstName1 TestLastName1');
            peopleCloudComponent.checkSelectedPeople('TestFirstName2 TestLastName2');
            peopleCloudComponent.checkSelectedPeople('TestFirstName3 TestLastName3');

        });

        it('[C309678] Should not fetch the preselect users when mandatory parameters Id, Email and username are missing', () => {
            peopleGroupCloudComponentPage.clickPeopleCloudMultipleSelection();
            peopleGroupCloudComponentPage.checkPeopleCloudMultipleSelectionIsSelected();
            peopleGroupCloudComponentPage.clickPreselectValidation();
            expect(peopleGroupCloudComponentPage.getPreselectValidationStatus()).toBe('true');

            peopleGroupCloudComponentPage.enterPeoplePreselect(`[{"firstName":"${apsUser.firstName}","lastName":"${apsUser.lastName},"` +
                `{"firstName":"${activitiUser.firstName}","lastName":"${activitiUser.lastName}",{"firstName":"${noRoleUser.firstName}","lastName":"${noRoleUser.lastName}"]`);
            browser.sleep(200);
            expect(peopleCloudComponent.getAssigneeFieldContent()).toBe('');

        });

    });

});
