//Delete_product
  function productDelete(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      dangerMode: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // If the user clicks "Yes, delete it!", proceed with the deletion
        window.location.href = `/admin/delete-product/?id=${id}`;
      } else {
        // If the user clicks "Cancel", do not proceed with the deletion
      }
    });
  }


  


  //Delete_Category
  function deleteCategory(categoryName) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the category "${categoryName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      dangerMode: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        // If the user clicks "Delete", proceed with the deletion
        window.location.href = `/admin/deleteProductCategory?categoryName=${encodeURIComponent(categoryName)}`;
      } else {
        // If the user clicks "Cancel", do nothing
      }
    });
  }


  

  //Delete_SubCategory
    function confirmDelete(categoryName,subcategoryName) {
      Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this subcategory!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        dangerMode: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = `/admin/deleteProdutSubcategory?categoryName=${categoryName}&subcategoryName=${subcategoryName}`
          // If the user clicks "Yes, delete it!", proceed with the deletion
          return true;
        } else {
          // If the user clicks "Cancel", do not proceed with the deletion
          return false;
        }
      });
    }
 
    //Return_With_Expiry
    function isWithinReturnWindow(orderDate) {
      const returnWindowDays = 3; // Change this to the number of days for the return window
      const now = new Date();
      const orderDateObj = new Date(orderDate);
      orderDateObj.setDate(orderDateObj.getDate() + returnWindowDays);
      return now <= orderDateObj;
    }

    
  