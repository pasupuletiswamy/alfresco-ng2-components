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

import { Component, EventEmitter, OnInit, OnChanges, Input, Output, SimpleChanges } from '@angular/core';
import { AlfrescoTranslationService } from 'ng2-alfresco-core';
import { AnalyticsService } from '../services/analytics.service';
import { ReportQuery } from '../models/report.model';
import { Chart } from '../models/chart.model';

@Component({
    moduleId: module.id,
    selector: 'activiti-analytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements  OnInit, OnChanges {

    @Input()
    appId: string;

    @Input()
    reportId: number;

    @Input()
    debug: boolean = false;

    @Output()
    onSuccess = new EventEmitter();

    @Output()
    onShowReport = new EventEmitter();

    @Output()
    onError = new EventEmitter();

    reportParamQuery = new ReportQuery();

    reports: any[];

    constructor(private translate: AlfrescoTranslationService,
                private analyticsService: AnalyticsService) {
        console.log('AnalyticsComponent');
        if (translate) {
            translate.addTranslationFolder('node_modules/ng2-activiti-analytics/src');
        }
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.reset();
    }

    public showReport($event) {
        this.reportParamQuery = $event;
        this.analyticsService.getReportsByParams(this.reportId, this.reportParamQuery).subscribe(
            (res: Chart[]) => {
                this.reports = res;
                this.onShowReport.emit(res);
            },
            (err: any) => {
                this.onError.emit(err);
                console.log(err);
            }
        );
    }

    public reset() {
        if (this.reports) {
            this.reports = undefined;
        }
    }
}
