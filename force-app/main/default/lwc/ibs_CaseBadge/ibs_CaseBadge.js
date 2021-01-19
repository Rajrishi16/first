import { LightningElement, api } from 'lwc';
import metadataSettings from '@salesforce/apex/IBSCaseBadgeController.metadataSettings';
import Community_Case_List_View_URL from '@salesforce/label/c.Community_Case_List_View_URL';

export default class CaseListView extends LightningElement {
    records;
    BASE_URL = Community_Case_List_View_URL;
    index = -1;
    connectedCallback() {
        this.getListViewVountFromController();
    }
    get getListViewId(){
        this.index++;
        return this.BASE_URL+this.records[this.index].id;
    }
    getListViewVountFromController() {
        console.log('OUTPUT : hello mohit');
        metadataSettings().
            then(result => {
                console.log('result', result);
                this.records = result;
            }).catch(error => {
                console.log('Error while gettinId', error);
            });
    }
}