import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable }     from 'rxjs/Observable';
import { FormsModule, FormBuilder, FormControl,FormGroup } from '@angular/forms';
import { NgbModal , NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';

import { getObjectKeys } from '../../shared/common';
import { Pet } from '../models/pet';
import { petForm } from './pet-form';
import { PetService } from '../pet-services/pet.service';
import { AuthenticationService } from '../../login/login.service';
import { CheckFormErrors } from '../../shared/form-error.service';


@Component({
  selector: 'pet-form',
  moduleId: module.id,
  templateUrl: 'pet-form.component.html',
  providers:[PetService, CheckFormErrors ]
})

export class PetFormComponent implements OnInit {

  petForm: FormGroup;
  formFields: Array<string>;
  observable : Observable<any>;
  closeResult: string;
  view: string;
  modalRef: NgbModalRef;
  @Input()
  pet: Pet;
  @Output() updatePetsEmitter: EventEmitter<string>=new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private petService: PetService,
    private router: Router,
    private modalService:NgbModal,
    private formErrorsService: CheckFormErrors,
    private authenticationService:AuthenticationService
    ) {
    this.petForm = this.fb.group(petForm());
    this.formFields = getObjectKeys(this.petForm.controls);
  }

  ngOnInit() {
    if (this.pet) {
      this.view = 'update_pet_' + this.pet.id ;
      // update form controls with pet properties in update view
      for (let field of getObjectKeys(this.pet)){
        let control = this.petForm.controls[field];
        if (control) {
          console.log('control ' + control + ', populating form');
            //(<FormControl>control).setValue(this.pet[field], true);
            control.setValue(this.pet[field] , true);
        }
      }
    }else {
      this.view = 'create_pet';
    }
  }

  formHasError(field:string) {
    let errorsMap=this.formErrorsService.getErrors(this.petForm);

    for (let errorItem of errorsMap){
      if (errorItem[field]!== undefined) {
        return errorItem[field];
      }
    }
    return null;
  }
  open(content:Component) {
      this.modalRef = this.modalService.open(content);
      this.modalRef.result.then((result) => {
        this.closeResult = `Closed `;
      }, (reason) => {
        this.closeResult = `Dismissed `;
      });
  }
  savePet() {
    console.log('validating form.. ');
    if (this.petForm.dirty && this.petForm.valid) {
      console.log('valid form, trying to save');
      let form = this.petForm.value;
      let formPet = new Pet({
        id: form.id,
        name: form.name,
        price: form.price,
        quantity: form.quantity,
        description: form.description
      });

      if(this.pet) {
        this.observable = this.petService.updatePet(this.pet, formPet);
      } else {
        this.observable = this.petService.addPet(formPet);
      }
      this.observable.subscribe((data) => {
        console.log('observable.subscribe notify parent component');
        this.updatePetsEmitter.emit('getall');
      });
      this.modalRef.close();
      //this.petsChanged.emit(null);
    } else {
      console.log('this.petForm.dirty && this.petForm.valid' + this.petForm.dirty +'&&'+ this.petForm.valid);
    }
  }

}
