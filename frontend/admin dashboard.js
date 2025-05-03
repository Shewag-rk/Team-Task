let api_category = 'http://localhost:3000/categories',
    api_products = 'http://localhost:3000/products',
    filter_category = document.querySelector('#selector'),
    category = {}, products = [],editId=0;

function getCategory() {
    fetch(api_category)
        .then(data => {
            if (data.status === 200) { return data.json() }
            else { throw new console.error('Somthing wrong') }
        })
        .then(res => {
            filter_category.innerHTML = '<option selected disabled>Select</option>';
            form_select.innerHTML = '<option selected disabled>Select</option>';
            res.forEach(ele => {
                category[ele.id] = ele.name;
                let option1 = document.createElement('option');
                option1.textContent = ele.name;
                let option2 = document.createElement('option');
                option2.textContent = ele.name;
                filter_category.append(option1);
                form_select.append(option2);
            });
        })
        .catch(err => console.log(err))
}

function getData() {
    getCategory();
    fetch(api_products)
        .then(data => {
            if (data.status === 200) { return data.json() }
            else { throw new console.error('Somthing wrong') }
        })
        .then(res => { getProducts(res); products = res;  categoryCheck(); })
        .catch(err => console.log(err))
}

getData();


let tbody = document.querySelector('.main_body');

function getProducts(data) {
    tbody.innerHTML = '';
    data.forEach(n => {
        let row = document.createElement('tr');
        if (Number(n.quantity) < 5) row.style.background = 'rgb(248, 213, 133)';
        if (Number(n.quantity) === 0) row.style.background = 'rgb(248, 133, 133)';
        row.innerHTML = `
      <td><div class='image_container'><img src='${n.image}'></div></td>
      <td>${n.name}</td>
      <td class='noOfquantity'>${n.quantity}</td>
      <td class='pricevalue'>${n.price}</td>
      <td>${category[n.categoryId]}</td>
      <td class='action-buttons'></td>
    `;
        let buttons = document.createElement('div');
        buttons.classList.add('buttons');
        let edit_button = document.createElement('button');
        edit_button.classList.add("fa-solid", "fa-pen-to-square");

        edit_button.addEventListener('click',()=>{
            editId=n.id;flag=false;
            getName.value=n.name;
            getPrice.value=n.price;
            getImage.value=n.image;
            getQuantity.value=n.quantity;
            form_select.value=category[n.categoryId];
            submit.textContent="Edit Product";
            formHide();
            calculation();
        })

        let delete_button = document.createElement('button');
        delete_button.classList.add("fa-solid", "fa-trash");

        delete_button.addEventListener('click',()=>{
            dataDelete(n.id)
            calculation()
        })

        buttons.append(edit_button, delete_button);
        row.querySelector('.action-buttons').appendChild(buttons);
        tbody.appendChild(row);
    })

    calculation();
}

function Sort(key, data) {
    products.sort((a, b) => {
        let x = a[key],
            y = b[key];
        if (typeof x ==='String') { x = x.toLowerCase().trim(); y = y.toLowerCase().trim() };        
        if (data) return x > y ? 1 : y > x ? -1 : 0;
        return y > x ? 1 : x > y ? -1 : 0;
    })
    getProducts(products)
}

let arrange = document.querySelector('.orderBY');

arrange.addEventListener('input', () => {
    if (arrange.value == 'A-Z order') Sort('name', true);
    else if (arrange.value == 'Z-A order') Sort('name', false);
    else if (arrange.value == 'ASC by price') Sort('price', true)
    else if (arrange.value == 'DESC by price') Sort('price', false)
})

filter_category.addEventListener('input', () => {
    let key = findCategory(filter_category);
    let array = products.filter(x => x.categoryId == key);
    getProducts(array);
    calculation()
})

let form = document.querySelector('.main_form');

function formHide() {
    let form_container = document.querySelector('.form_container');
    form_container.classList.toggle('display');
    
}

let xmark = document.querySelector('.fa-square-xmark')

    xmark.addEventListener('click',()=>{
        if(submit.textContent=='Edit Product')submit.textContent="Add product";
        form.reset()
        flag=true;
    })

let form_select = document.querySelector('#form_select'),
    getName = document.querySelector('#name'),
    getQuantity = document.querySelector('#Quantity'),
    getPrice = document.querySelector('#price'),
    getImage = document.querySelector('#image'),
    submit = document.querySelector('#submit');

submit.addEventListener('click', (event) => {
    event.preventDefault();
    if (!getName.value.trim())return magError('Please Enter a Name', 0)
    else if (!getQuantity.value.trim())return magError('Please Enter a Quantity', 1)
    else if (!getPrice.value.trim())return magError('Please Enter a Price', 2)
    else if (!getImage.value.trim())return magError('Please Enter a Url', 3)
    else if (form_select.value == 'Select')return magError('Please Select Category', 4)
    myPost();
    if(submit.textContent=='Edit Product')submit.textContent="Add product";
    flag=true;
})

let errmsg = document.querySelectorAll('small');

function magError(content, id) {
    errmsg[id].innerHTML = content;
    setTimeout(() => {
        errmsg[id].innerHTML = '';
    }, 3000)
}

let flag = true;

function myPost() {
    fetch(`${api_products}${flag ? '/':`/${editId}`}`, {
        method: flag ? 'POST' : 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
            name: getName.value,
            price: getPrice.value,
            quantity: getQuantity.value,
            image: getImage.value,
            categoryId: findCategory(form_select)
        })
    })
        .then(data => data.json())
        .then(res => console.log(true))
        .catch(err => console.log(err))
}

function findCategory(element){
    for (let x in category) { if (category[x].toLowerCase() == element.value.toLowerCase()) {return x}}
}

let searcher = document.querySelector('.search_input');

searcher.addEventListener('input',()=>{
    let array = products.filter(x => x.name.toLowerCase().includes(searcher.value.toLowerCase()))
    getProducts(array)
})

function dataDelete(id){
    fetch(`${api_products}/${id}`,{method:'DELETE'})
    .then(data => getData())
    .catch(err=> console.log(err))
}

let totalAmount = document.querySelector('#amount'),
    lowStockQuantity = document.querySelector('#quantityItems'),
    outOfStock=document.querySelector('#noStocks');

function calculation(){
    let total=0,lowstock=0,outstock=0;
    let NumberOfquantity=document.querySelectorAll('.noOfquantity'),
        fullPrice = document.querySelectorAll('.pricevalue');
    NumberOfquantity.forEach((n,i)=>{
        total+=Number(n.textContent)*Number(fullPrice[i].textContent)
        if(Number(n.textContent)<5)lowstock+=Number(n.textContent);
        if(Number(n.textContent)===0)outstock++;
    })
    totalAmount.innerHTML=`₹${total}`;
    lowStockQuantity.innerHTML=lowstock;
    outOfStock.innerHTML=outstock;
    if(total===0){totalAmount.style.background='rgb(248, 133, 133)'};
}

 let categorytbody = document.querySelector('#total_category');

 function categoryCheck(){
 
    for (let id in category) {
        let stock = 0, quantity = 0, total = 0;
        products.forEach(product => {
           if(Number(id)===Number(product.categoryId)){
            stock++;
            quantity+=Number(product.quantity)
            total+=Number(product.quantity)*Number(product.price)
           }
            
        });

        let row = document.createElement('tr')
                row.innerHTML=`<td>${category[id]}</td>
                                <td>${stock}</td>
                                <td>${quantity}</td>
                                <td>${total}</td>
                                 `
                categorytbody.append(row)
        console.log(quantity)  
    }
 }

let product = document.querySelector('.products');

function productsNavigate(){
    product.style.display='block'
}


 

