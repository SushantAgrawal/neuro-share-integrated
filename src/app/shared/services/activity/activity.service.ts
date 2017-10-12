import { Injectable } from "@angular/core";
import { Subject } from 'rxjs/Subject';
import { MsService } from '@sutterhealth/data-services';
import { MSPatientData } from '@sutterhealth/data-services/models/ms-patient-data.model';
import * as moment from 'moment';
import { ProgressNotesGeneratorService } from '@sutterhealth/progress-notes';

@Injectable()
export class ActivityService {

    private activitySource = new Subject<string>();
    private patientData: MSPatientData;

    activityData$ = this.activitySource.asObservable();

    constructor(private msService: MsService, private progressNotesGenerator: ProgressNotesGeneratorService) { }

    updateActivity(data: any) {
        this.patientData = {
            age_of_onset: data.age,
            last_updated_instant: moment().toString(),
            ms_type: data.diseaseType,
            ms_status_1: data.statusDisease,
            ms_status_2: data.statusType
        };
        let noteObject = {
            destination: 'progress-note',
            category: 'patient-data',
            source: 'Patient info',
            title: 'Patient info',
            editable: true,
            draggable: false,
            data: this.getMarkup(this.patientData),
            timestamp: moment().toString(),
            overwrite: true
        }

        this.progressNotesGenerator.pushObject(noteObject);
        this.msService.updateMSPatientData(this.patientData).subscribe(result => {
            this.activitySource.next(data);
        });
    }

    getMarkup(patientData): string {
        return `<div><b>Age Of Onset: </b>${patientData['age_of_onset']}</div>
            <div><b>MS Type: </b>${patientData['ms_type']}</div>
            <div><b>Status: </b>${patientData['ms_status_1']} ${patientData['ms_status_2']}</div>`;
    }
}