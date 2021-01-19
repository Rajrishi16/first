import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';
import ADD_PRODUCTS_CART_URL from '@salesforce/label/c.add_products_cart_url';
import COMMUNITY_LOGIN_URL from '@salesforce/label/c.community_login_url';
export default class AddProducts extends LightningElement {
 
  cartUrl = ADD_PRODUCTS_CART_URL;
  loginUrl = COMMUNITY_LOGIN_URL;
  @api brands;
  sortingIcon = "";
  sortedColumn;
  sortedDirection = 'asc';
  @track allProducts;
  @track _products;
  error;
  selectedBrandValue = "Alle merken";
  selectAllCheckbox = false;
  @track userSelectedProducts = {};
  @track productsFromCookie;

  @api
  get products() {
      return this.products;
  }

  /* set products(value) {
      if(value){       
        this.allProducts = JSON.parse(JSON.stringify(value));       
          this.allProducts.map(pro => {
            if(this.userSelectedProducts.hasOwnProperty(pro.Product2Id)){
              pro.selectedProduct = true;
              pro.hoeveelheid = this.userSelectedProducts[pro.Product2Id];
            }
            pro.UnitPrice = pro.UnitPrice.toLocaleString("nl-NL", {minimumFractionDigits: 2});
          })       
        this._products = this.allProducts;
      }
  } */

  set products(value) {
      if(value){   

        this.allProducts = JSON.parse(JSON.stringify(value));       
           this.allProducts.map(pro => {
            if(this.userSelectedProducts.hasOwnProperty(pro.Product2Id)){
              pro.selectedProduct = true;
              pro.hoeveelheid = this.userSelectedProducts[pro.Product2Id];
            }
            pro.UnitPrice = pro.UnitPrice.toLocaleString("nl-NL", {minimumFractionDigits: 2});
          })       
        this._products = this.allProducts; 
        this.getProductFromCookieAndSetData();
      }
  }

  setSelectedProducts(){
    
      this.allProducts.map(pro => {
          if(this.productsFromCookie.hasOwnProperty(pro.Product2Id)){
            pro.selectedProduct = true;
            pro.hoeveelheid = parseInt(this.productsFromCookie[pro.Product2Id]);
            this.userSelectedProducts[pro.Product2Id] = parseInt(this.productsFromCookie[pro.Product2Id]);
          }
          pro.UnitPrice = pro.UnitPrice.toLocaleString("nl-NL", {minimumFractionDigits: 2});
        })       
      this._products = [...this.allProducts];
      console.log(this._products);
  }

  async getProductFromCookieAndSetData(){
      try {
            let products = {};
            let productQuantity = await this.getCookie("product_info");
            if (productQuantity) {
                productQuantity.split("@").forEach(pro => {
                    products[pro.split("#")[0]] = pro.split("#")[1];
                })
            }
            if (Object.keys(products).length) {
                this.productsFromCookie = JSON.parse(JSON.stringify(products));
                this.setSelectedProducts();
            }else {
              this._products = [...this.allProducts];
            }
        } catch (error) {
            console.log('error : ', error);
        }
  }

  async getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
  
  

  handleSortProducts(event) { 
    console.log('idd : ',event.currentTarget.dataset.id);
      this.sortedDirection = this.sortedDirection === "asc" ? "desc" : "asc";
      this.sortingIcon = this.sortedDirection === "desc" ? 'utility:arrowdown' : 'utility:arrowup';
    
    let table = JSON.parse(JSON.stringify(this.allProducts));

    let direction =  this.sortedDirection;
    let fieldName = event.currentTarget.dataset.id;

    let results = table.sort(function(a,b){
      if(fieldName == 'Name' || fieldName == 'Description' ){
          if(a.Product2[fieldName] < b.Product2[fieldName])
            return direction === 'asc' ? -1 : 1;
          else if(a.Product2[fieldName] > b.Product2[fieldName])
            return direction === 'asc' ? 1 : -1;
          else
            return 0;
        }else{
            if(a[fieldName] < b[fieldName])
              return direction === 'asc' ? -1 : 1;
            else if(a[fieldName] > b[fieldName])
              return direction === 'asc' ? 1 : -1;
            else
              return 0;
        }
    })
    
    console.log('OUTPUT : ',results);
    this.allProducts = results;
  }

  handleProductSerach(event) {
    console.log('handleProductSerach:',event.target.value);
    let searchTerm = event.target.value;
      if (searchTerm.length && searchTerm.trim().length) {
          let filterProduct = this._products.filter(el => el.Product2.Name.toLowerCase().includes(searchTerm.trim().toLowerCase()));
          this.allProducts = [...filterProduct];
      } else {       
         this._products.map(pro => {
          if(this.userSelectedProducts.hasOwnProperty(pro.Product2Id)){
            pro.selectedProduct = true;
            pro.hoeveelheid = parseInt(this.userSelectedProducts[pro.Product2Id]);
          }
        })                
          this.allProducts = [...this._products];
      }

  }

  handleSelectAllCheckbox(event) {
    this.selectAllCheckbox = event.currentTarget.checked;
    let tempProducts = [];
    let tempProductIds = [];
    this.allProducts.forEach((element) => {
      element.selectedProduct = this.selectAllCheckbox;
      tempProducts.push(element);
      if(this.selectAllCheckbox){
        this.userSelectedProducts[element.Product2Id] = element.hoeveelheid;        
      }       
      else{
        delete this.userSelectedProducts[element.Product2Id];
      }
        
    });
    this.setCookies();
    this.allProducts = tempProducts; 
    //this._products = tempProducts; 
  }


  setCookies(){
    let products = [];
    for (const key in this.userSelectedProducts) {
        products.push(`${key}#${this.userSelectedProducts[key]}`);      
    }
    this.productsFromCookie = this.userSelectedProducts;
    document.cookie = "product_info=" + products.join('@') + ";path=/";
  }

  handleProductSelection(event) {
    console.log('handleProductSelection clicked');
    this.selectAllCheckbox = false;
    let tempProductIds = [];
    let pro = this.allProducts[event.currentTarget.dataset.index];

    this.allProducts[event.currentTarget.dataset.index].selectedProduct = !this.allProducts[event.currentTarget.dataset.index].selectedProduct;
    console.log('selected :',this.allProducts[event.currentTarget.dataset.index].selectedProduct);
    if(this.allProducts[event.currentTarget.dataset.index].selectedProduct){
     this.userSelectedProducts[pro.Product2Id] = pro.hoeveelheid;
    }else {
     delete this.userSelectedProducts[pro.Product2Id];
    }
    this.setCookies();
    this.productIds = tempProductIds;
    //this._products = JSON.parse(JSON.stringify(this.allProducts));
  }

  handleBrandChange(event) {
   this.template.querySelector('[data-id="searchInput"]').value = '';
    this.selectAllCheckbox = false;
        this.dispatchEvent(new CustomEvent('selectbrand', {
            detail: event.target.value
        }));
  }

  handleHoeveelheidChange(event){ 
    let proId = this.allProducts[event.currentTarget.dataset.index].Product2Id;
    this.allProducts[event.currentTarget.dataset.index].hoeveelheid = event.currentTarget.value;
      if(this.userSelectedProducts.hasOwnProperty(proId)){
        this.userSelectedProducts[proId] = event.currentTarget.value;
      }
       this.setCookies();
    //this._products = JSON.parse(JSON.stringify(this.allProducts));
  }

  handleBestellenClick(){
      if(this.productsFromCookie && typeof this.productsFromCookie == 'object' && Object.keys(this.productsFromCookie).length){
         if(!USER_ID){
            window.location.href = this.loginUrl;  
        }else {
          window.location.href = this.cartUrl;
        }
      }else {
        const noProductSelected = new ShowToastEvent({
            message:  'Select minimaal één product',
            variant: 'error',
        })
        this.dispatchEvent(noProductSelected);
      }
     
  }
}