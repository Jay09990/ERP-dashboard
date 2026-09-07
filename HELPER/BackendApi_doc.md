# DB DETAILS

## 1. Master database:

→ db name : crm_admin_db
→ owner : postgres
→ hostname/address : localhost
→ port : 5432
→ username : postgres
→ password : 12345678

## 2. Company database:

→ db name : crm_company_abc(company_name)
→ owner : postgres
→ hostname/address : localhost
→ port : 5432
→ username : postgres
→ password : 12345678

---

---

# Session Stored details:

stored in session

Session {
cookie: {
path: '/',
_expires: 2026-08-06T17:52:58.319Z,
originalMaxAge: 28800000,
httpOnly: true,
secure: false
},
user: {
userId: 1,
companyId: 1,
roleId: 1,
email: 'rahul@abc.com',

phone: ‘1234567890’,
fullName: 'Rahul Shah',
permissions: [
[Object], [Object], [Object], [Object]
],
permissionSummary: {
totalPermissions: 88,
allowedPermissions: 88,
deniedPermissions: 0,
modules: [Array]
},
financialYearId: 1,
ipAddress: '::ffff:127.0.0.1',
deviceInfo: 'Thunder Client (https://www.thunderclient.com)'
}
}

### trancate the admin db for restart

```jsx
TRUNCATE TABLE login_audit_logs,global_users,companies RESTART IDENTITY;
```

```jsx
TRUNCATE TABLE 
tbl_delivery_challan_tax_details,tbl_delivery_challan_items,tbl_delivery_challan,
tbl_proforma_tax_details,tbl_proforma_items,tbl_proforma,
tbl_quotation_tax_details,tbl_quotation_items,tbl_quotation,
tbl_purchase_order_tax_details,tbl_purchase_order_items,tbl_purchase_orders,
debit_notes,debit_note_tax_details,debit_note_items,
tbl_purchase_invoice_tax_details,tbl_purchase_invoice_items,tbl_purchase_invoices,
credit_notes,credit_note_tax_details,credit_note_items,
tbl_invoice_tax_details,tbl_invoice_items,tbl_invoice,
tbl_party_contact_person,tbl_party_addresses,tbl_party 
RESTART IDENTITY;
```

## Common changes

```jsx
import { getRequestInfo } from "../utils/crypto.js";

const { ipAddress, deviceInfo } = getRequestInfo(req);

now use directly ipAddress, deviceInfo

```

```jsx
await logAudit(companyPool, {
          module_name: "Company",
          page_name: "Company Bank Details",
          table_name: "tbl_company_bank_detail",
          table_id: bank_result.rows[0].comp_bank_id,
          action_type: "UPDATE",
          action_description: "Company bank details updated",
          old_value: null,
          new_value: JSON.stringify(bank_result.rows[0]),
          change_fields: null,
          user_id: req.session.user.userId,
          role_id: req.session.user.roleId,
          ip_address: ipAddress,
          device_info: deviceInfo,
          company_id: companyId
      });
```

NOTES:

IF CREATE ANY NEW PAGE OR MODULE FOR PERMISSION ADD THIS DEFAULT PERMISSION

PATH : 

C:\Users\Admin\Desktop\ERP-CRM\crm_project\constants\defaultPermissions.js

```jsx
const DEFAULT_PERMISSIONS = [
  { permissionName: "company:profile:update", moduleName: "Company" },
  { permissionName: "users:view", moduleName: "Users" },
  { permissionName: "users:create", moduleName: "Users" },
  { permissionName: "users:update", moduleName: "Users" },
  { permissionName: "users:delete", moduleName: "Users" },
  { permissionName: "users:password:update", moduleName: "Users" },
  { permissionName: "roles:view", moduleName: "Roles" },
  { permissionName: "roles:create", moduleName: "Roles" },
  { permissionName: "roles:update", moduleName: "Roles" },
  { permissionName: "roles:delete", moduleName: "Roles" },
  { permissionName: "permissions:view", moduleName: "Permissions" },
  { permissionName: "permissions:manage", moduleName: "Permissions" },
  
  ............HERE ADD NEW DEFAULT PERMISSION ................
];
```

if add any permission in routes then add

```jsx
import { requireAuth, requirePermission } from "../middleware/authMiddleware.js";

router.put("/profile", requireAuth, requirePermission("company:profile:update"), updatemeController);   //USE FOR UPDATE THE PROFILE DATA  //1

```

Add series 

```jsx
import { getNextSeries } from "../services/seriesService.js"

const { companyId, userId, financialYearId } = req.session.user;
const employeeSeries = await getNextSeries(companyPool,{
        documentTypeId:1,
        companyId,
        userId,
        financialYearId
    });
    
//employeeSeries.series
//its a used as a value
```

---

---

# Testing Flow:

### http://localhost:4500/api/admin/register

POST

```jsx
{
  "full_name": "admin",
  "email":"admin@admin.com",
  "password": "1234"
}
```

### http://localhost:4500/api/admin/login

POST

```jsx
{
  "email":"admin@admin.com",
  "password": "1234"
}
```

### http://localhost:4500/api/admin/companies

POST

```jsx
{
	"companyName": "abc Pvt Ltd",
	"companyCode": "ABC01",
	"companyEmail": "info@abc.com",
	"gstNo": "Gst123",
	"phone": "0987654321",
	"address": "address",
	"subscriptionPlanId": 1,
	"superAdminFirstName": "Rahul",
	"superAdminLastName": "Shah",
	"superAdminEmail": "rahul@abc.com",
	"superAdminPhone": "1234567890",
	"superAdminPassword": "abc@123",
	"db_name":"abc"
}
```

### http://localhost:4500/api/admin/companies/16

DELETE

—> ONLY DEACTIVE THE COMPANY NOT DELETE THIER COMPANY DATABASE

### http://localhost:4500/api/admin/companies/16/harddelete

DELETE

—> PERMENTATLLY DELETE THEIR COMPANY DATABASE AND DETAILS OF THIS COMPANY IN ADMIN DATABASE

### http://localhost:4500/api/change_status/:companyId/:status

POST

### http://localhost:4500/api/auth/login

POST

```jsx
{ "login": "rahul@abc.com", "password": "abc@123" }
							OR
{ "login": "1234567890", "password": "abc@123" }
```

### http://localhost:4500/api/auth/profile

PUT

```jsx
{
	"company_name": "",
	"trade_name": "",
	"logo":"",
	"registration_number":"",
	"gst_no":"",
	"pan_no":"",
	"phone":"",
	"email":"",
	"website":"",
	"contact_name":"", 
  "address_line1":"",
  "address_line2":"",
  "city_id":null,
  "state_id":null,
  "country_id":null,
  "pincode":"",
  "authorized_signature":"",
  "bank_id":null,
  "account_holder_name":"",
  "account_no":"",
  "ifsc_code":"",
  "swift_code":"",
  "branch_name":"",
  "upi_no":"",
  "opening_balance":null
}

{

	"company_name": "abc Pvt Ltd",
  "trade_name": "trade_abc",
  "logo": null,
  "registration_number": "1234",
  "gst_no": "gst123",
  "pan_no": "pan123",
  "phone": "7412589630",
  "email": "info@abc.com",
  "website": "abc.com",
  "contact_name": "Rahul",
  "address_line1": "address1",
  "address_line2": "address2",
  "city_id": "1",
  "state_id": "7",
  "country_id": "1",
  "pincode": "380001",
  "authorized_signature": null,
  "bank_id":"1",
  "account_holder_name":"ABC_COMPANY",
  "account_no":"acc0123",
  "ifsc_code":"ifsc123",
  "swift_code":"swift123",
  "branch_name":"ahmedabad",
  "upi_no":"upi123",
  "opening_balance":"50000"

 }
```

### http://localhost:4500/api/auth/users

POST

```jsx
{ 
  "firstName":"user1", 
  "lastName":"luser1", 
  "phone":"0987654321",
  "email":"user1@gmail.com", 
  "password":"12345678", 
  "roleId":"1"
}
```

### http://localhost:4500/api/auth/users/:userId

PUT

```jsx
{ 
  "firstName":"rahul", 
  "lastName":"shukla", 
  "phone":"0987654321",
  "profile_image":"",
  "status":"active", 
  "roleId":"1"
}
```

### http://localhost:4500/api/auth/user/password

PUT

```jsx
{
  "current_password": "abc@123",
  "new_password":"rahul@123"
}
```

### http://localhost:4500/api/auth/roles

GET 

POST 

```jsx
{
	"role_name": "hr",
	"description": "example"
}
```

### http://localhost:4500/api/auth/roles/:roleId

PUT

```jsx
{
	"role_name": "hr",
	"description": "example"
}
```

DELETE  http://localhost:4500/api/auth/roles/:roleId

### http://localhost:4500/api/auth/permissions

GET

POST

```jsx
{ 
	permissionName: "company:profile:update", 
	moduleName: "Company" 
},
{ 
	permissionName: "permissions:manage", 
	moduleName: "Permissions" 
}
```

### http://localhost:4500/api/auth/roles/:roleId/permissions

GET

PUT

```jsx
	{
		"permissions": [
	    {
	      "permission_name": "company:profile:update",
	      "module_name": "Company",
	      "is_allowed": true
	    },
	    {
	      "permission_name": "permissions:manage",
	      "module_name": "Permissions",
	      "is_allowed": true
	    },
	    {
	      "permission_name": "permissions:view",
	      "module_name": "Permissions",
	      "is_allowed": true
	    },
	    {
	      "permission_name": "users:view",
	      "module_name": "Users",
	      "is_allowed": true
	    }....etc
	  ]
  }
  
```

> PARTY ADD
> 

http://localhost:4500/api/party/customers

http://localhost:4500/api/party/vendors

POST

```jsx
{
  "party_name": "new_customer1",
  "phone":"8521479630",
  "email":"cust1@gmail.com",
  "gst_no": "gstCust",
  "pan_no": "panCust",
  "website":"cust_website",
  "contact_name":"cust 1",
  "notes":"notes",
  "opening_balance":"2000",
  "authorized_signature":"",
  "currency_id":1,

  "addresses": [
    {
      "address_type": "billing",
      "address_label": "Head Office",
      "attention_to": "Rahul Patel",
      "phone": "9876543210",
      "address_line1": "123 Main Road",
      "address_line2": "Near XYZ",
      "city_id": 1,
      "state_id": 7,
      "country_id": 1,
      "pincode": "380001"
    },
    {
      "address_type": "shipping",
      "address_label": "Warehouse",
      "attention_to": "Amit Shah",
      "phone": "9876500000",
      "address_line1": "456 Warehouse Road",
      "address_line2": "",
      "city_id": 1,
      "state_id": 7,
      "country_id": 1,
      "pincode": "380002"
    }
  ],

  "contactPersons": [
    {
      "name": "Rahul Patel",
      "email": "rahul@gmail.com",
      "phone": "9876543210"
    },
    {
      "name": "Amit Shah",
      "email": "amit@gmail.com",
      "phone": "9876500000"
    }
  ]
}
```

http://localhost:4500/api/party/customers/:customerId

http://localhost:4500/api/party/vendors/:vendorId

PUT

```jsx
{
  "party_name": "new_customer_1",
  "phone":"8521479630",
  "email":"cust_1@gmail.com",
  "gst_no": "gstCust123",
  "pan_no": "panCust123",
  "website":"cust_website123",
  "contact_name":"cust 1",
  "notes":"notes",
  "opening_balance":"20003",
  "authorized_signature":"",
  "currency_id":1,

  "addresses": [
    {
      "address_id": ,     //ADDRESSID
      "address_type": "billing",
      "address_label": "Updated Head Office",
      "attention_to": "Rahul",
      "phone": "9876543210",
      "address_line1": "Updated Road",
      "address_line2": "",
      "city_id": 1,
      "state_id": 7,
      "country_id": 1,
      "pincode": "380001"
    },

    {
      "address_id": ,       //ADDRESSID
      "address_type": "shipping",
      "address_label": "Warehouse",
      "attention_to": "Amit",
      "phone": "9876500000",
      "address_line1": "Warehouse Road",
      "address_line2": "",
      "city_id": 1,
      "state_id": 7,
      "country_id": 1,
      "pincode": "380002"
    },

    {
      "address_type": "both",
      "address_label": "New Branch",
      "attention_to": "Priya",
      "phone": "9876000000",
      "address_line1": "New Branch Road",
      "address_line2": "",
      "city_id": 1,
      "state_id": 7,
      "country_id": 1,
      "pincode": "380003"
    }
  ],

  "contactPersons": [
    {
      "person_id": ,   //CONTACT PERSON ID
      "name": "Rahul Patel Updated",
      "email": "rahul.new@gmail.com",
      "phone": "9876543210"
    },

    {
      "person_id": ,    //CONTACT PERSON ID
      "name": "Amit Shah",
      "email": "amit@gmail.com",
      "phone": "9876500000"
    },

    {
      "name": "New Contact",
      "email": "new@gmail.com",
      "phone": "9876111111"
    }
  ]
}
```

```jsx
INSERT INTO units_of_measure(unit_name, unit_code, unit_type, user_id) VALUES
('Numbers', 'NOS', 'count', 1),
('kilogram', 'KG', 'weight', 1);

INSERT INTO item_type(item_type_name, company_id, user_id) VALUES
('Product', 1, 1),
('Raw Material', 1, 1);

INSERT INTO item_categories(category_name, parent_category_id, user_id, company_id) VALUES
('parent category 1', null, 1, 1),
('parent category 2', null,1, 1),
('Sub category 1.1', 1 ,1, 1),
('Sub category 1.2', 1 ,1, 1),
('Sub category 2.1', 2 ,1, 1),
('Sub category 2.2', 2 ,1, 1),
('Sub category 2.3', 2 ,1, 1);

INSERT INTO tax_types(tax_name, tax_percentage, tax_type, applicable_on, user_id) VALUES
('CGST', 9, 'percentage', 'both', 1),
('SGST', 9, 'percentage', 'both', 1),
('IGST', 18, 'percentage', 'both', 1);

```

ADD master Data : item_type, item_category, unit_of_measure, tax_types

http://localhost:4500/api/items/items		      http://localhost:4500/api/items/items/:itemsId
post										put

```jsx
{
  "item_name": "new_product1",
  "item_description":"desc",
  "item_specification":"",
  "item_type":1,    //reference item_type
  "item_perent_category": 1,   //reference item_category
  "item_category": 3,   //reference item_category
  "hsn_code": "hsn123",
  "unit_id": 1,  //reference unit_of_measure
  "conv_unit_id": 1,   //reference unit_of_measure
  "sales_currency_id": 1,   //reference currency master
  "sales_qty": "20",
  "sales_convert_qty": "20",
  "sales_rate": "2000",
  "sales_conv_rate": "2000",
  "purchase_currency_id": 1,   //reference currency master
  "purchase_qty": "30",
  "purchase_convert_qty": "30",
  "purchase_rate": "3000",
  "purchase_conv_rate": "3000",
  "tax_id": 1,   //reference tax master
  "status": "active"
}
```

## QUOTATION MODULE:———

http://localhost:4500/api/quotation 

POST

```jsx

{
    "party_id": 1,
    "quotation_date": "2026-08-12",
    "valid_until": "30-8-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "round_off": "0.00",
    "terms_conditions": "terms",
    "notes": "TEST QUOTATION",
    "status": "draft",
    "itemsDetails": [
      {
        "item_id": 1,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "item_id": 2,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "quotation_item_index": 0,
        "tax_id": 1
      },
      {
        "quotation_item_index": 0,
        "tax_id": 2
      },
      {
        "quotation_item_index": 1,
        "tax_id": 1
      },
      {
        "quotation_item_index": 1,
        "tax_id": 2
      }
    ]
  }
```

http://localhost:4500/api/quotation/:quotationId

PUT

```jsx

{
    "party_id": 1,
    "quotation_date": "2026-08-22",
    "valid_until": "30-8-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "round_off": "0.00",
    "terms_conditions": "terms",
    "notes": "TEST QUOTATION",
    "status": "draft",
    "itemsDetails": [
      {
	      "quotation_item_id": 1,
        "item_id": 1,
        "description": "prod 1",
        "quantity": 5,
        "hsn_code": "hsn12345q",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
	      "quotation_item_id": 2,
        "item_id": 2,
        "description": "prod 2",
        "quantity": 7,
        "hsn_code": "hsn123452q",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
	      "tax_detail_id": 1,
        "quotation_item_id": 1,
        "tax_id": 1
      },
      {
	      "tax_detail_id": 2,
        "quotation_item_id": 1,
        "tax_id": 2
      },
      {
	      "tax_detail_id": 3,
        "quotation_item_id": 2,
        "tax_id": 1
      },
      {
	      "tax_detail_id": 4,
        "quotation_item_id": 2,
        "tax_id": 2
      }
    ]
  }
```

## SALES ODER MODULE:———

http://localhost:4500/api/sales_order

POST

```jsx
{
    "party_id": 1,
    "sales_order_date": "2026-08-12",
    "expected_delivery_date": "30-8-2026",
    "quotation_id": null,
    "quotation_no": null,
    "customer_po_no": "customer po no",
    "customer_po_date": "22-08-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "shipping_charges": "0.00",
    "round_off": "0.00",
    "paid_amount": "0.00",
    "payment_term_id": null,
    "terms_conditions": "terms",
    "notes": "TEST SALES ORDER",
    "status": "draft",
    "itemsDetails": [
      {
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "sales_order_item_index": 0,
        "tax_id": 1
      },
      {
        "sales_order_item_index": 0,
        "tax_id": 2
      },
      {
        "sales_order_item_index": 1,
        "tax_id": 1
      },
      {
        "sales_order_item_index": 1,
        "tax_id": 2
      }
    ]
  }
```

http://localhost:4500/api/sales_order/:sales_orderId

PUT

```jsx

{
    "party_id": 1,
    "sales_order_date": "2026-08-12",
    "expected_delivery_date": "30-8-2026",
    "quotation_id": null,
    "quotation_no": null,
    "customer_po_no": "customer po no",
    "customer_po_date": "22-08-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "shipping_charges": "0.00",
    "round_off": "0.00",
    "paid_amount": "0.00",
    "payment_term_id": null,
    "terms_conditions": "terms",
    "notes": "TEST SALES ORDER",
    "status": "draft",
    "itemsDetails": [
      {
	      "sales_order_item_id": 1,
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
	    },
      {
	      "sales_order_item_id": 2,
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350,
        "tax_amount": 31437
      }
    ],
    "taxDetails": [
      {
	      "tax_detail_id": 1,
	      "sales_order_item_id": 1,
        "tax_id": 1
      },
      {
	      "tax_detail_id": 2,
        "sales_order_item_id": 1,
        "tax_id": 2
      },
      {
	      "tax_detail_id": 3,
        "sales_order_item_id": 2,
        "tax_id": 1
      },
      {
	      "tax_detail_id": 4,
        "sales_order_item_id": 2,
        "tax_id": 2
      }
    ]
  }
```

## PURCHASE ODER MODULE:———

http://localhost:4500/api/purchase_order

POST

```jsx
{
    "party_id": 1,
    "purchase_order_date": "2026-08-12",
    "due_date": "30-8-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "shipping_charges": "0.00",
    "round_off": "0.00",
    "paid_amount": "0.00",
    "payment_term_id": null,
    "terms_conditions": "terms",
    "notes": "TEST PURCHASE ORDER",
    "status": "draft",
    "itemsDetails": [
      {
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "purchase_order_item_index": 0,
        "tax_id": 1
      },
      {
        "purchase_order_item_index": 0,
        "tax_id": 2
      },
      {
        "purchase_order_item_index": 1,
        "tax_id": 1
      },
      {
        "purchase_order_item_index": 1,
        "tax_id": 2
      }
    ]
  }
```

http://localhost:4500/api/purchase_order/:purchase_orderId

PUT

```jsx
{
    "party_id": 1,
    "purchase_order_date": "2026-08-12",
    "due_date": "30-8-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "shipping_charges": "0.00",
    "round_off": "0.00",
    "paid_amount": "0.00",
    "payment_term_id": null,
    "terms_conditions": "terms",
    "notes": "TEST PURCHASE ORDER",
    "status": "draft",
    "itemsDetails": [
      {
        "purchase_order_item_id": 1,
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "purchase_order_item_id": 2,
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "tax_detail_id": 1,
        "purchase_order_item_id": 1,
        "tax_id": 1
      },
      {
        "tax_detail_id": 2,
        "purchase_order_item_id": 1,
        "tax_id": 2
      },
      {
        "tax_detail_id": 3,
        "purchase_order_item_id": 2,
        "tax_id": 1
      },
      {
        "tax_detail_id": 4,
        "purchase_order_item_id": 2,
        "tax_id": 2
      }
    ]
  }
```

## PROFORMA MODULE:———

http://localhost:4500/api/proforma

POST

```jsx
{
    "party_id": 1,
    "proforma_date": "2026-08-12",
    "valid_until": "30-8-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "round_off": "0.00",
    "terms_conditions": "terms",
    "notes": "TEST PROFORMA",
    "status": "draft",
    "itemsDetails": [
      {
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "proforma_item_index": 0,
        "tax_id": 1
      },
      {
        "proforma_item_index": 0,
        "tax_id": 2
      },
      {
        "proforma_item_index": 1,
        "tax_id": 1
      },
      {
        "proforma_item_index": 1,
        "tax_id": 2
      }
    ]
  }
```

http://localhost:4500/api/proforma/:proformaId

PUT

```jsx
{
    "party_id": 1,
    "proforma_date": "2026-08-12",
    "valid_until": "30-8-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "round_off": "0.00",
    "terms_conditions": "terms",
    "notes": "TEST PROFORMA",
    "status": "draft",
    "itemsDetails": [
      {
				"proforma_item_id": 1,
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
				"proforma_item_id": 2,
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
				"tax_detail_id": 1,
        "proforma_item_id": 1,
        "tax_id": 1
      },
      {
				"tax_detail_id": 2,
        "proforma_item_id": 1,
        "tax_id": 2
      },
      {
				"tax_detail_id": 3,
        "proforma_item_id": 2,
        "tax_id": 1
      },
      {
				"tax_detail_id": 4,
        "proforma_item_id": 2,
        "tax_id": 2
      }
    ]
  }
```

## DELIVERY CHALLAN MODULE:———

http://localhost:4500/api/delivery_challan

POST

```jsx
{
    "party_id": 1,
    "delivery_date": "2026-08-12",
    "expected_delivery_date": "30-8-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "round_off": "0.00",
    "terms_conditions": "terms",
    "notes": "TEST delivery challan",
    "status": "draft",
    "itemsDetails": [
      {
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "delivery_challan_item_index": 0,
        "tax_id": 1
      },
      {
        "delivery_challan_item_index": 0,
        "tax_id": 2
      },
      {
        "delivery_challan_item_index": 1,
        "tax_id": 1
      },
      {
        "delivery_challan_item_index": 1,
        "tax_id": 2
      }
    ]
  }
```

http://localhost:4500/api/delivery_challan/:deliverychallanId

PUT

```jsx
{
    "party_id": 1,
    "delivery_date": "2026-08-12",
    "expected_delivery_date": "30-8-2026",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "round_off": "0.00",
    "terms_conditions": "terms",
    "notes": "TEST delivery challan",
    "status": "draft",
    "itemsDetails": [
      {
        "delivery_challan_item_id": 1,
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "delivery_challan_item_id": 2,
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "tax_detail_id": 1,
        "delivery_challan_item_id": 1,
        "tax_id": 1
      },
      {
        "tax_detail_id": 2,
        "delivery_challan_item_id": 1,
        "tax_id": 2
      },
      {
        "tax_detail_id": 3,
        "delivery_challan_item_id": 2,
        "tax_id": 1
      },
      {
        "tax_detail_id": 4,
        "delivery_challan_item_id": 2,
        "tax_id": 2
      }
    ]
  }
```

## INVOICE MODULE:———

http://localhost:4500/api/invoice

POST

```jsx
{
    "party_id": 1,
    "invoice_date": "2026-08-12",
    "due_date": null,
    "po_no": "po123",
    "po_date": "2026-08-14",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "payment_term_id": null,
    "currency_id": 1,
    "shipping_charges": "1350.00",
    "round_off": "0.00",
    "paid_amount": "25000.00",
    "terms_conditions": "terms",
    "notes": "paid 25,000\npending 3,00,000",
    "status": "draft",
    "user_id": 1,
    "company_id": 1,
    "itemsDetails": [
      {
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "invoice_item_index": 0,
        "tax_id": 1
      },
      {
        "invoice_item_index": 0,
        "tax_id": 2
      },
      {
        "invoice_item_index": 1,
        "tax_id": 1
      },
      {
        "invoice_item_index": 1,
        "tax_id": 2
      }
    ]
  }
```

http://localhost:4500/api/invoice/2

PUT

```jsx
{
    "party_id": 1,
    "invoice_date": "2026-08-12",
    "due_date": null,
    "po_no": "po123",
    "po_date": "2026-08-14",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "payment_term_id": null,
    "currency_id": 1,
    "shipping_charges": "1350.00",
    "round_off": "0.00",
    "paid_amount": "25000.00",
    "terms_conditions": "terms",
    "notes": "paid 25,000\npending 3,00,000",
    "status": "draft",
    "itemsDetails": [
      {
        "invoice_item_id": 1,
        "item_id": 2,
        "description": " prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      },
      {
        "invoice_item_id": 2,
        "item_id": 3,
        "description": "prod 2 ",
        "quantity": 7,
        "hsn_code": "hsn123452",
        "unit_id": 1,
        "unit_rate": 25000,
        "discount_percent": 0.2,
        "discount_flat": 350
      }
    ],
    "taxDetails": [
      {
        "tax_detail_id": 1,
        "invoice_item_id": 1,
        "tax_id": 1
      },
      {
        "tax_detail_id": 2,
        "invoice_item_id": 1,
        "tax_id": 2
      },
      {
        "tax_detail_id": 3,
        "invoice_item_id": 2,
        "tax_id": 1
      },
      {
        "tax_detail_id": 4,
        "invoice_item_id": 2,
        "tax_id": 2
      }
    ]
  }
```

## PURCHASE INVOICE MODULE:———

http://localhost:4500/api/purchase_invoice

POST

```jsx
{
    "party_id": 1,
    "pi_date":"18-08-2026",
    "invoice_date": "2026-08-12",
    "due_date": null,
    "po_no": "po123",
    "po_date": "2026-08-14",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "round_off": "0.00",
    "paid_amount": "25000.00",
    "terms_conditions": "terms",
    "notes": "paid 25,000\npending 3,00,000",
    "status": "draft",
    "user_id": 1,
    "company_id": 1,
    "itemsDetails": [
      {
        "item_id": 2,
        "description": "prod 1 ",
        "quantity": 5,
        "hsn_code": "hsn12345",
        "unit_id": 1,
        "unit_rate": 20000,
        "discount_percent": 0.5,
        "discount_flat": 500
      }
    ],
    "taxDetails": [
      {
        "purchase_invoice_item_index": 0,
        "tax_id": 1
      },
      {
        "purchase_invoice_item_index": 0,
        "tax_id": 2
      }
    ]
  }
```

http://localhost:4500/api/purchase_invoice/:invoiceId

PUT

```jsx
{
    "party_id": 1,
    "pi_date":"18-08-2026",
    "invoice_date": "2026-08-12",
    "due_date": null,
    "po_no": "po123",
    "po_date": "2026-08-14",
    "billing_address_id": 1,
    "shipping_address_id": 1,
    "currency_id": 1,
    "round_off": "0.00",
    "paid_amount": "30000.00",
    "terms_conditions": "terms",
    "notes": "paid 30,000",
    "status": "draft",
    "itemsDetails": [
        {
          "purchase_invoice_item_id": 1,  //imp
          "purchase_invoice_id": 1,  //imp
          "item_id": 2,
          "description": "prod 1 ",
          "quantity": 5,
          "hsn_code": "hsn12345",
          "unit_id": 1,
          "unit_rate": 20000,
          "total_rate": 100000,
          "discount_percent": 0.5,
          "discount_flat": 500
        }
      ],
      "taxDetails": [
        {
          "tax_detail_id": 1,  //imp
          "tax_id": 1,
          "tax_percentage": 9
        },
        {
          "tax_detail_id": 2,  //imp
          "tax_id": 2,
          "tax_percentage": 9
        }
      ]
    }
```

---

---

# TABLES WORKFLOW:

## In Admin site Create New Company:

### http://localhost:4500/api/admin/register

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| admin | admins | add |

http://localhost:4500/api/admin/login

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| admin | admins | update → last_login |

### 1] http://localhost:4500/api/admin/companies

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| admin | companies | add |
| company | create database | create  |
| company | roles | add |
| company | users | add |
| company | tbl_company_profile | add |
| company | tbl_company_bank_detail | add |
| admin | global_users | add |
| admin | companies | update → status & time |

### http://localhost:4500/api/admin/companies/16

DELETE

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| admin | global_users | update → is_deleted&status |
| admin | companies | update → is_deleted,status & time |

### http://localhost:4500/api/admin/companies/16/harddelete

DELETE

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | drop the database  | **permanent** |
| admin | global_users | delete |
| admin | companies | delete |

## In Login time

### 2] http://localhost:4500/api/auth/login

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | users | update → last_login |
| company | login_audit_logs | add |

## In Profile Update

### 3] http://localhost:4500/api/auth/profile   PUT

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_company_profile | UPDATE → all details |
| company | tbl_company_bank_detail | update → all details |
| ADMIN | companies | update → some values |
| company | audit_logs | add 2 rows → tbl_company_profile, tbl_company_bank_detail |

## Create Sub Users from company superadmin

### 4] http://localhost:4500/api/auth/users

notes :  only super admin create the new users

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | users | add |
| admin | global_users | add |
| company | audit_logs | add |

### http://localhost:4500/api/auth/users

PUT

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | users | update |
| admin | global_users | update |
| company | audit_logs | add |

### http://localhost:4500/api/auth/users/2

DELETE

notes :  only super admin deleted the users

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | users | DELETE |
| admin | global_users | DELETE |
| company | audit_logs | add |

### http://localhost:4500/api/auth/user/password

PUT

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | users | update→PASSWORD |
| company | audit_logs | add |

### http://localhost:4500/api/auth/roles

GET 

POST 

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | roles | add |
| company | audit_logs | add |

### http://localhost:4500/api/auth/roles/:roleId

PUT

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | roles | update |
| company | audit_logs | add |

DELETE  http://localhost:4500/api/auth/roles/:roleId

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | roles | update → is_deleted |
| company | audit_logs | add |

### http://localhost:4500/api/auth/permissions

GET

POST

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | permission | add |

### http://localhost:4500/api/auth/roles/:roleId/permissions

GET

PUT

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | role_permissions | if existing then update
 else  add |

### http://localhost:4500/api/auth/users/:userId/permissions

GET 

PUT

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | user_permissions | if existing then update
 else  add |

> PARTY ADD
> 

http://localhost:4500/api/party/customers

http://localhost:4500/api/party/vendors

POST

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_party | add |
| company | tbl_party_addresses | add |
| company | tbl_party_contact_person | add |
| company | audit_logs | add |

http://localhost:4500/api/party/customers/:customerId

http://localhost:4500/api/party/vendors/:vendorId

PUT

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_party | update |
| company | tbl_party_addresses | update |
| company | tbl_party_contact_person | update |
| company | audit_logs | add |

DELETE

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_party | update → is_delete, status |
| company | tbl_party_addresses | update → is_delete, status |
| company | tbl_party_contact_person | update → is_delete |
| company | audit_logs | add |

### INVOICE MODULE:———

http://localhost:4500/api/invoice

POST

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_invoice | add |
| company | tbl_invoice_items | add |
| company | tbl_invoice_tax_details | add |
| company | audit_logs | add |

http://localhost:4500/api/invoice/2

PUT

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_invoice | updatE |
| company | tbl_invoice_items | update |
| company | tbl_invoice_tax_details | update |
| company | audit_logs | add |

DELETE

http://localhost:4500/api/invoice/:invoiceId

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_invoice | update → is_delete |
| company | tbl_invoice_items | update → is_delete |
| company | tbl_invoice_tax_details | update → is_delete |
| company | audit_logs | add |

http://localhost:4500/api/invoice/:invoiceId/:invoiceItemId

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_invoice_items | update → is_delete |
| company | tbl_invoice_tax_details | update → is_delete |

http://localhost:4500/api/invoice/:invoiceId/:status

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_invoice | update  → status |

---

---

## List of work

> Admin DB
> 
- [x]  register
- [x]  login
- [x]  logout
- [x]  add company
- [x]  read company
- [x]  delete company
- [x]  change active status

---

> Company DB
> 
- [x]  login
- [x]  logout
- [x]  company profile view
- [x]  company profile update
- [x]  new user create by super admin
- [x]  user info edit
- [x]  user delete deleted by super admin
- [x]  user change password
- [x]  role add
- [x]  role update
- [x]  role delete
- [x]  permission
- [x]  role permission
- [x]  user permission

- [x]  quotation
- [x]  sales order
- [x]  purchase order
- [x]  proforma
- [x]  delivery challan
- [x]  sales invoice
- [x]  purchase invoice
- [x]  credit notes
- [x]  debit notes

> Item Master & Items
> 
- item_type
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- item_categories
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- item_attributes
    - [ ]  ADD
    - [ ]  UPDATE
    - [ ]  DELETE
    - [ ]  VIEW
- warehouse_mst
    - [ ]  ADD
    - [ ]  UPDATE
    - [ ]  DELETE
    - [ ]  VIEW
- tbl_items
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- item_images
    - [ ]  ADD
    - [ ]  UPDATE
    - [ ]  DELETE
    - [ ]  VIEW

> Party Master & Party
> 
- tbl_party
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- tbl_party_contact_person
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- tbl_party_addresses
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW

---

> Master List in Company DB
> 
- country_mst
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- state_mst
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- city_mst
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- currency_mst
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- tax_types
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- units_of_measure (UOM)
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- financial_years
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- payment_terms
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- bank_mst
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- cr_dr_reason_mst (for dropdown)
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- chart_of_accounts
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- departments
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- branch_mst
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- designations
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- shift_master
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- holiday_master
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- cost_centers
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- document_type
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW
- document_series
    - [x]  ADD
    - [x]  UPDATE
    - [x]  DELETE
    - [x]  VIEW

---

---

work flow

1] first the admin login then create the new company. here auto created database, super-admin and their all permission access.

2] then super admin login and first update their company profile and then add the role and other master data and then create thier other users and add their user or role wise permission