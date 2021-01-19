import { api, LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import USER_ID from '@salesforce/user/Id';
import ADD_PRODUCTS_CART_URL from '@salesforce/label/c.add_products_cart_url';
import COMMUNITY_LOGIN_URL from '@salesforce/label/c.community_login_url';
export default class ProductsOnMobileMode extends LightningElement {

    cartUrl = ADD_PRODUCTS_CART_URL;
    loginUrl = COMMUNITY_LOGIN_URL;
    @api brands = [];
    @track allProducts;
    @track filteredProducts;
    @track userSelectedProducts = new Map();
    @track selectedProductCount = 0;
    sortDirection = 'asc';

    @api get products() {
        return this.products;
    }
    set products(value) {
        if (value) {
            let data = value.map(obj =>{
                let pro = Object.assign({}, obj);
                pro.UnitPrice = pro.UnitPrice.toFixed(2);
                pro.priceWithCommaSeparator =  obj.UnitPrice.toLocaleString("nl-NL", {minimumFractionDigits: 2});
                return pro;
            })
            this.allProducts = JSON.parse(JSON.stringify(data));
            this.filteredProducts = JSON.parse(JSON.stringify(data));
            this.getProductFromCookieAndSetData();
        }
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
            let exitingProductids = Object.keys(products);
            let exitingProductMap = new Map();
            this.filteredProducts.forEach(pro => {
                if(exitingProductids.indexOf(pro.Product2Id) !== -1){
                    exitingProductMap.set(pro.Product2Id, pro);
                }
            });
            this.userSelectedProducts = exitingProductMap;
            this.selectedProductCount = exitingProductMap.size;
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

    setCookies(){
        let products = [];
        for (const key of this.userSelectedProducts.keys()) {
            products.push(`${key}#1`);      
        }
        document.cookie = "product_info=" + products.join('@') + ";path=/";
    }

    handleProductSelection(event) {
        let selectedProductId = event.currentTarget.dataset.productId;
        if (!this.userSelectedProducts.has(selectedProductId)) {
            let filterProduct = this.allProducts.filter(el => el.Product2Id === selectedProductId);
            this.userSelectedProducts.set(selectedProductId, { ...filterProduct[0] });
        }
        this.setCookies();
        this.selectedProductCount = this.userSelectedProducts.size;
    }

    handleSubmit() {
        if (!this.selectedProductCount) {
            this.showNotification('Select minimaal één product', 'error');
            return;
        }

        let selectedProduct = [...this.userSelectedProducts.values()].map(item => {
            return `${item.Product2Id}#1`;
        });
        document.cookie = "product_info=" + selectedProduct.join('@') + ";path=/";

        if (!USER_ID) {
            window.location.href = this.loginUrl;
        } else {
            window.location.href = this.cartUrl;
        }
    }

    handleBrandChange(event) {
        this.dispatchEvent(new CustomEvent('selectbrand', {
            detail: event.target.value
        }));
    }

    sortData(fieldName, sortDirection) {
        let sortResult = Object.assign([], this.filteredProducts);
        this.filteredProducts = sortResult.sort(function (a, b) {
            if(sortDirection == 'asc'){
                return a[fieldName] - b[fieldName];
            }else{
                return b[fieldName] - a[fieldName];
            }
        })

    }

    handleDataSorting() {
        this.sortDirection = this.sortDirection == 'asc' ? 'desc' : 'asc';
        this.sortData('UnitPrice', this.sortDirection);
    }

    handleProductSearching(event) {
        let searchTerm = event.target.value;
        if (searchTerm.length && searchTerm.trim().length) {
            let filterProduct = this.allProducts.filter(el => el.Product2.Name.toLowerCase().includes(searchTerm.trim().toLowerCase()));
            this.filteredProducts = [...filterProduct];
        } else {
            this.filteredProducts = [...this.allProducts];
        }
    }

    openFilterPanel() {
        this.template.querySelector('.filterPanel').style.width = "80%";
        this.template.querySelector('.sidepanel_backdrop').style.display = "block";
    }

    closeFilterPanel() {
        this.template.querySelector('.filterPanel').style.width = "0";
        this.template.querySelector('.sidepanel_backdrop').style.display = "none";
    }

    showNotification(m, v) {
        this.dispatchEvent(new ShowToastEvent({
            message: m,
            variant: v
        }));
    }

}