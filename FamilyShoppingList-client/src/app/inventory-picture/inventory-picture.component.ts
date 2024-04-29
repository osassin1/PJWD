import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// compression for pictures (jpeg, png); 
// if iOS is used then HEIC format needs to
// be converted to JPEG and then compressed
import { NgxImageCompressService } from 'ngx-image-compress';
import heic2any from "heic2any";

@Component({
  selector: 'app-inventory-picture',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './inventory-picture.component.html',
  styleUrl: './inventory-picture.component.css'
})
export class InventoryPictureComponent implements AfterViewInit, OnDestroy {

  // this will allow the click on loading an image
  // during ngOnInit
  @ViewChild('imageInput', { static: false }) imageInput!: ElementRef;

  // this is the return of the image
  @Output() pictureChange = new EventEmitter<string>();

  // either uploaded or taken picture (mobil)
  selectedPicture: any;

  constructor(
    private imageCompress: NgxImageCompressService
  ) { }

  ngAfterViewInit(): void {
    const event = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
    this.imageInput.nativeElement.dispatchEvent(event);
  }

  ngOnDestroy() {
    delete this.selectedPicture;
  }



  // --- Pictures / Upload ----
  //
  // This entire section handles the upload of pictures incl.
  // converting them (e.g., from iOS HEIC to JPEG) and compressing
  // them with the goal to stay under 100kB.
  //
  // Source: https://alexcorvi.github.io/heic2any/
  //         https://www.npmjs.com/package/ngx-image-compress
  //
  //  Alex Covi provided examples on how to convert HEIC/HEIF to JPEG
  //
  //  David Faure provided examples on how to compress PNG/JPEG to JPEG
  //
  // Either upload a picture from your computer or if mobile
  // take a picture that will be used.


  imageSelectCancel() {
    delete this.selectedPicture;
  }

  imageSelected($event: any) {

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

    // Test is the file has HEIC format and convert it to JPEG
    // and then (the convProm) compress it.
    if (/image\/hei(c|f)/.test(fileName.type) || fileName.type == "") {
      convProm = heic2any({ blob: fileName, toType: "image/jpeg", quality: 0 }).then((jpgBlob: any) => {
        let newName = fileName.name.replace(/\.[^/.]+$/, ".jpg");
        file = this.blobToFile(jpgBlob, newName);
      }).catch(err => {
        //Handle error
      });
    } else {
      //This is not a HEIC image so we can just resolve
      // and compress it.
      convProm = Promise.resolve(true);

      const file = new FileReader();
      file.readAsDataURL(fileName);
      file.onload = () => {
        this.selectedPicture = file.result as string;
        this.imageCompress.compressFile(file.result as string, 0, 100, 100, 200, 200).then(
          compressedImage => {
            this.selectedPicture = compressedImage;
            this.pictureChange.emit(compressedImage);
          }
        )
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

        _thisComp.selectedPicture = reader.result;
        _thisComp.imageCompress.compressFile(reader.result as string, 0, 100, 100, 200, 200).then(
          compressedImage => {
            _thisComp.selectedPicture = compressedImage;
            _thisComp.pictureChange.emit(compressedImage);

          }
        )

      }
    });
  }

  // Chris Barr provided help converting a Blob into a file
  // source: https://stackoverflow.com/a/29390393
  //
  private blobToFile = (theBlob: Blob, fileName: string): File => {
    let b: any = theBlob;

    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModified = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }
}

//--- end of file ---