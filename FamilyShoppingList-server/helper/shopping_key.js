class ShoppingKey {

    constructor(date, store_id, family_id){
      this.shopping_date = date;
      this.store_id = parseInt(store_id);
      this.family_id = parseInt(family_id);
    }
  
    key(){
      return JSON.stringify(this);
    }
  
    valid(){
      if(this.shopping_date=="undefined" ||
        this.store_id==null ||
        this.family_id==null){
          return false;
        }
        return true;
    }
  }

  module.exports = ShoppingKey