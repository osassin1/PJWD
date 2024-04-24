class ListByCategoryKey{
    constructor(date, store_id, family_id, list_category_id){
      this.shopping_date = date;
      this.store_id = parseInt(store_id);
      this.family_id = parseInt(family_id);
      this.list_category_id = parseInt(list_category_id);
    }
  
    key(){
      return JSON.stringify(this);
    }
  }
  
  module.exports = ListByCategoryKey