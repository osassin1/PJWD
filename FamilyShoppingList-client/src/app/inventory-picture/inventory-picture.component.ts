import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// import { Observable } from 'rxjs';
// import { Subject } from 'rxjs';

// compression for pictures (jpeg, png); 
// if iOS is used then HEIC format needs to
// be converted to JPEG and then compressed
import { NgxImageCompressService } from 'ngx-image-compress';
import heic2any from "heic2any";



@Component({
  selector: 'app-inventory-picture',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './inventory-picture.component.html',
  styleUrl: './inventory-picture.component.css'
})
export class InventoryPictureComponent implements OnInit, AfterViewInit {

  // this will allow the click on loading an image
  // during ngOnInit
  @ViewChild('imageInput', { static: false }) imageInput!: ElementRef;

  // this input is not needed
  @Input() list_category_id: number = 0;

  // this is the return of the image
  @Output() pictureChange = new EventEmitter<string>();

  // get background color from caller
  //not needed
  //@Input() background: string = "";

  // don't need that
  selectShoppingListForm!: FormGroup;

  // not sure if needed here
  isImageDisabled: boolean = false;

  // ok to take a picture to add to inventory
  // ... maybe obsolete
  takePicture: string[] = [];  //"ok|no|wait"

    // either uploaded or taken picture (mobil)
    selectedPicture: any[] = [];

  // debugging
  imageCompressMessage: string = "";

  constructor(
    private imageCompress: NgxImageCompressService,
    private formBuilder: FormBuilder,
  ) {
  }


  ngAfterViewInit(): void {
    const event = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
    this.imageInput.nativeElement.dispatchEvent(event);
  }

  ngOnInit() {
    console.log('InventoryPictureComponent::OnInit')
  this.selectShoppingListForm = this.formBuilder.group({
    image_upload: null,
  });

 
  console.log(this.selectShoppingListForm.controls['image_upload']);

  }


  doDiscardNewInventoryItem(list_category_id: number) {
    console.log('doDiscardNewInventoryItem')
    this.selectedPicture[list_category_id] = null;
    // this.selectShoppingListForm.controls['new_inventory_item_name'].reset(null);
    // this.selectShoppingListForm.controls['new_inventory_item_unit'].reset(null);
    // this.selectShoppingListForm.controls['image_upload'].reset();
    // this.newInventoryQuantity[list_category_id] = 0;
    this.takePicture[list_category_id] = "ok"; //false;
    this.isImageDisabled = false;
  }



// --- Pictures / Upload ----
//
// This entire section handles the upload of pictures incl.
// converting them (e.g., from iOS HEIC to JPEG) and compressing
// them with the goal to stay under 100kB.
//

// Either upload a picture from your computer or if mobile
// take a picture that will be used

// triggerSnapshot(list_category_id: number): void {
//   console.log('triggerSnapshot(list_category_id: number): void');
//   this.list_category_id = list_category_id;
//   this.trigger.next();
// }


imageSelectCancel(list_category_id: number) {
  //this.isImageDisabled = true;
  //console.log('imageSelectCancel')
  this.takePicture[list_category_id] == "wait"
  this.doDiscardNewInventoryItem(list_category_id);
}

  imageSelected($event: any, list_category_id: number) {
    //console.log("imageSelected", $event);
    this.isImageDisabled = true;

    if (this.takePicture[list_category_id] == "wait") {
      console.error('this.takePicture[list_category_id]', this.takePicture[list_category_id]);
      return;
    }
    this.imageCompressMessage = "<start>";
    this.takePicture[list_category_id] = "wait";

    const fileName = $event.target.files[0];
    if (typeof fileName.size === undefined) {
      console.error('no file selected');
      return;
    }
    console.log("size", fileName.size);
    console.log("type", fileName.type);

    let blob: Blob = fileName;
    let file: File = fileName;


    let convProm: Promise<any>;

    if (/image\/hei(c|f)/.test(fileName.type) || fileName.type == "") {
      console.log('heic');
      convProm = heic2any({ blob: fileName, toType: "image/jpeg", quality: 0 }).then((jpgBlob: any) => {
        console.log('(1) jpgBlob', jpgBlob);
        this.imageCompressMessage += "<t:heic->jpeg>,"
        let newName = fileName.name.replace(/\.[^/.]+$/, ".jpg");
        file = this.blobToFile(jpgBlob, newName);
        //this.selectedPicture[list_category_id] = jpgBlob as string;
      }).catch(err => {
        //Handle error
      });
    } else {
      console.log('type', fileName.type);
      //This is not a HEIC image so we can just resolve
      convProm = Promise.resolve(true);

      this.imageCompressMessage += "<t:" + fileName.type + ">,";
      const file = new FileReader();
      file.readAsDataURL(fileName);
      file.onload = () => {
        this.selectedPicture[list_category_id] = file.result as string;
        this.imageCompress.compressFile(file.result as string, 0, 100, 100, 200, 200).then(
          compressedImage => {
            this.selectedPicture[list_category_id] = compressedImage;
            this.pictureChange.emit(compressedImage);
          }
        )
        this.imageCompressMessage += "<c:" + this.selectedPicture[list_category_id].length + ">,";
      }

    }

    convProm.then(() => {

      let reader = new FileReader();
      let _thisComp = this;

      //Add file to FileReader
      if (file) {
        reader.readAsDataURL(file);
      }
      //Listen for FileReader to get ready
      reader.onload = function () {

        _thisComp.selectedPicture[list_category_id] = reader.result;
        _thisComp.imageCompress.compressFile(reader.result as string, 0, 100, 100, 200, 200).then(
          compressedImage => {
            _thisComp.selectedPicture[list_category_id] = compressedImage;
            _thisComp.pictureChange.emit(compressedImage);
            _thisComp.imageCompressMessage += "<c:" + _thisComp.selectedPicture[list_category_id].length + ">,";
          }
        )

      }
    });

    this.takePicture[list_category_id] = "wait";
    this.imageCompressMessage += "<end>"
    //this.newInventoryQuantity[list_category_id] = 1;

    //this.selectShoppingListForm.controls['new_inventory_item_quantity'].setValue(1);
    //this.selectShoppingListForm.controls['new_inventory_item_unit'].setValue(3);   // item(s)
  }
  private blobToFile = (theBlob: Blob, fileName: string): File => {
    let b: any = theBlob;

    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModified = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

}
