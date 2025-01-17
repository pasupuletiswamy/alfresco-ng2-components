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

import { by, browser, protractor } from 'protractor';
import { DatePickerPage } from '../../../material/pages/date-picker.page';
import { BrowserVisibility } from '../../../core/utils/browser-visibility';

export class DateRangeFilterPage {

    fromField = by.css('input[data-automation-id="date-range-from-input"]');
    fromDateToggle = by.css('mat-datepicker-toggle[data-automation-id="date-range-from-date-toggle"]');
    toField = by.css('input[data-automation-id="date-range-to-input"]');
    toDateToggle = by.css('mat-datepicker-toggle[data-automation-id="date-range-to-date-toggle"]');
    applyButton = by.css('button[data-automation-id="date-range-apply-btn"]');
    clearButton = by.css('button[data-automation-id="date-range-clear-btn"]');
    fromErrorMessage = by.css('mat-error[data-automation-id="date-range-from-error"]');
    toErrorMessage = by.css('mat-error[data-automation-id="date-range-to-error"]');
    filter;

    constructor(filter) {
        this.filter = filter;
    }

    getFromDate() {
        return this.filter.element(this.fromField).getAttribute('value');
    }

    putFromDate(date) {
        this.checkFromFieldIsDisplayed();
        this.filter.element(this.fromField).clear();
        this.filter.element(this.fromField).sendKeys(date);
        this.filter.element(this.fromField).sendKeys(protractor.Key.ENTER);
        return this;
    }

    getFromCalendarSelectedDate() {
        const selectedDate = this.openFromDatePicker().getSelectedDate();
        new DatePickerPage().closeDatePicker();
        return selectedDate;
    }

    openFromDatePicker() {
        BrowserVisibility.waitUntilElementIsClickable(this.filter.element(this.fromDateToggle));
        this.filter.element(this.fromDateToggle).click();
        return new DatePickerPage().checkDatePickerIsDisplayed();
    }

    openToDatePicker() {
        BrowserVisibility.waitUntilElementIsClickable(this.filter.element(this.toDateToggle));
        this.filter.element(this.toDateToggle).click();
        return new DatePickerPage().checkDatePickerIsDisplayed();
    }

    clickFromField() {
        BrowserVisibility.waitUntilElementIsClickable(this.filter.element(this.fromField));
        this.filter.element(this.fromField).click();
        return this;
    }

    checkFromErrorMessageIsDisplayed(msg: string) {
        BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.fromErrorMessage));
        browser.controlFlow().execute(async () => {
            await expect(this.filter.element(this.fromErrorMessage).getText()).toEqual(msg);
        });
        return this;
    }

    checkFromErrorMessageIsNotDisplayed() {
        BrowserVisibility.waitUntilElementIsNotVisible(this.filter.element(this.fromErrorMessage));
        return this;
    }

    checkFromFieldIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.fromField));
        return this;
    }

    checkFromDateToggleIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.fromDateToggle));
        return this;
    }

    getToDate() {
        return this.filter.element(this.toField).getAttribute('value');
    }

    putToDate(date) {
        this.checkToFieldIsDisplayed();
        this.filter.element(this.toField).clear();
        this.filter.element(this.toField).sendKeys(date);
        this.filter.element(this.toField).sendKeys(protractor.Key.ENTER);
        return this;
    }

    clickToField() {
        BrowserVisibility.waitUntilElementIsClickable(this.filter.element(this.toField));
        this.filter.element(this.toField).click();
        return this;
    }

    checkToErrorMessageIsDisplayed(msg) {
        BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.toErrorMessage));
        browser.controlFlow().execute(async () => {
            await expect(this.filter.element(this.toErrorMessage).getText()).toEqual(msg);
        });
        return this;
    }

    checkToFieldIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.toField));
        return this;
    }

    checkToDateToggleIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.toDateToggle));
        return this;
    }

    clickApplyButton() {
        BrowserVisibility.waitUntilElementIsClickable(this.filter.element(this.applyButton));
        this.filter.element(this.applyButton).click();
        return this;
    }

    checkApplyButtonIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.applyButton));
        return this;
    }

    checkApplyButtonIsEnabled() {
        browser.controlFlow().execute(async () => {
            await expect(this.filter.element(this.applyButton).isEnabled()).toBe(true);
        });
        return this;
    }

    checkApplyButtonIsDisabled() {
        browser.controlFlow().execute(async () => {
            await expect(this.filter.element(this.applyButton).isEnabled()).toBe(false);
        });
        return this;
    }

    checkClearButtonIsDisplayed() {
        BrowserVisibility.waitUntilElementIsVisible(this.filter.element(this.clearButton));
        return this;
    }
}
