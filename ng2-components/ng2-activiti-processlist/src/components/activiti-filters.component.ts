/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
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

import { Component, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlfrescoTranslationService } from 'ng2-alfresco-core';
import { ActivitiProcessService } from './../services/activiti-process.service';
import { FilterRepresentationModel } from 'ng2-activiti-tasklist';
import { Observable, Observer } from 'rxjs/Rx';

declare let componentHandler: any;

@Component({
    moduleId: module.id,
    selector: 'activiti-process-instance-filters',
    templateUrl: './activiti-filters.component.html',
    styleUrls: ['activiti-filters.component.css']
})
export class ActivitiProcessFilters implements OnInit, OnChanges {

    @Output()
    filterClick: EventEmitter<FilterRepresentationModel> = new EventEmitter<FilterRepresentationModel>();

    @Output()
    onSuccess: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onError: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    appId: number;

    @Input()
    appName: string;

    private filterObserver: Observer<FilterRepresentationModel>;
    filter$: Observable<FilterRepresentationModel>;

    currentFilter: FilterRepresentationModel;

    filters: FilterRepresentationModel [] = [];

    constructor(private translate: AlfrescoTranslationService,
                private activiti: ActivitiProcessService) {
        this.filter$ = new Observable<FilterRepresentationModel>(observer => this.filterObserver = observer).share();

        if (translate) {
            translate.addTranslationFolder('ng2-activiti-processlist', 'node_modules/ng2-activiti-processlist/dist/src');
        }
    }

    ngOnInit() {
        this.filter$.subscribe((filter: FilterRepresentationModel) => {
            this.filters.push(filter);
        });

        this.getFilters(this.appId, this.appName);
    }

    ngOnChanges(changes: SimpleChanges) {
        let appId = changes['appId'];
        if (appId && (appId.currentValue || appId.currentValue === null)) {
            this.getFiltersByAppId(appId.currentValue);
            return;
        }
        let appName = changes['appName'];
        if (appName && appName.currentValue) {
            this.getFiltersByAppName(appName.currentValue);
            return;
        }
    }

    /**
     * Return the task list filtered by appId or by appName
     * @param appId
     * @param appName
     */
    getFilters(appId?: number, appName?: string) {
        if (appName) {
            this.getFiltersByAppName(appName);
        } else {
            this.getFiltersByAppId(appId);
        }
    }

    /**
     * Return the filter list filtered by appId
     * @param appId - optional
     */
    getFiltersByAppId(appId?: number) {
        this.activiti.getProcessFilters(appId).subscribe(
            (res: FilterRepresentationModel[]) => {
                this.resetFilter();
                res.forEach((filter) => {
                    this.filterObserver.next(filter);
                });
                this.selectFirstFilter();
                this.onSuccess.emit(res);
            },
            (err) => {
                console.log(err);
                this.onError.emit(err);
            }
        );
    }

    /**
     * Return the filter list filtered by appName
     * @param appName
     */
    getFiltersByAppName(appName: string) {
        this.activiti.getDeployedApplications(appName).subscribe(
            application => {
                this.getFiltersByAppId(application.id);
                this.selectFirstFilter();
            },
            (err) => {
                console.log(err);
                this.onError.emit(err);
            });
    }

    /**
     * Pass the selected filter as next
     * @param filter
     */
    public selectFilter(filter: FilterRepresentationModel) {
        this.currentFilter = filter;
        this.filterClick.emit(filter);
    }

    /**
     * Select the first filter of a list if present
     */
    private selectFirstFilter() {
        if (!this.isFilterListEmpty()) {
            this.currentFilter = this.filters[0];
        } else {
            this.currentFilter = null;
        }
    }

    /**
     * Return the current task
     * @returns {FilterRepresentationModel}
     */
    getCurrentFilter(): FilterRepresentationModel {
        return this.currentFilter;
    }

    /**
     * Check if the filter list is empty
     * @returns {boolean}
     */
    isFilterListEmpty(): boolean {
        return this.filters === undefined || (this.filters && this.filters.length === 0);
    }

    /**
     * Reset the filters properties
     */
    private resetFilter() {
        this.filters = [];
        this.currentFilter = null;
    }
}
