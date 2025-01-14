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
import { BrowserActions } from '../../core/utils/browser-actions';

export class ProcessHeaderCloudPage {

    idField = element.all(by.css('span[data-automation-id*="id"] span')).first();
    nameField = element.all(by.css('span[data-automation-id*="name"] span')).first();
    statusField = element(by.css('span[data-automation-id*="status"] span'));
    initiatorField = element(by.css('span[data-automation-id*="initiator"] span'));
    startDateField = element.all(by.css('span[data-automation-id*="startDate"] span')).first();
    lastModifiedField = element.all(by.css('span[data-automation-id*="lastModified"] span')).first();
    parentIdField = element(by.css('span[data-automation-id*="parentId"] span'));
    businessKeyField = element.all(by.css('span[data-automation-id*="businessKey"] span')).first();

    getId() {
        return BrowserActions.getText(this.idField);
    }

    getName() {
        return BrowserActions.getText(this.nameField);
    }

    getStatus() {
        return BrowserActions.getText(this.statusField);
    }

    getInitiator() {
        return BrowserActions.getText(this.initiatorField);
    }

    getStartDate() {
        return BrowserActions.getText(this.startDateField);
    }

    getLastModified() {
        return BrowserActions.getText(this.lastModifiedField);
    }

    getParentId() {
        return BrowserActions.getText(this.parentIdField);
    }

    getBusinessKey() {
        return BrowserActions.getText(this.businessKeyField);
    }

}
