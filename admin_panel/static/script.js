const form = document.getElementById("productForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const response = await fetch("/add-product", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    alert(data.message);

    if(data.success){
        window.location.reload();
    }
});

async function deleteProduct(id){

    if(!confirm("Delete product?")) return;

    const response = await fetch(`/delete-product/${id}`, {
        method: "DELETE"
    });

    const data = await response.json();

    if(data.success){
        window.location.reload();
    }
}