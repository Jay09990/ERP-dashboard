## Frontend implementation coverage

The ERP frontend consumes the project and procurement endpoints below through
the same-origin API proxy. Project screens are available at `/projects` and
`/projects/:projectId`; requisitions, GRNs, and site issues are available at
`/procurement/requisitions`, `/procurement/grn`, and
`/procurement/site-issues`. The Express backend remains external to this
repository and must implement these routes. Lead routes later in this document
are intentionally excluded from the frontend implementation.

## PROJECT ROUTES:—

### → GET PROJECTS

GET

http://localhost:4500/api/project

http://localhost:4500/api/project/:projectId

http://localhost:4500/api/project?status=planning

http://localhost:4500/api/project?partyId=5

http://localhost:4500/api/project?status=in_progress&partyId=5

STATUS FLOW : ["planning", "approved", "in_progress", "on_hold", "delayed", "completed", "closed", "cancelled"]

### → CREATE THE NEW PROJECT

http://localhost:4500/api/project 

POST

```jsx
{
  "project_name": "Ahmedabad Industrial Plant Installation",
  "party_id": 1,
  "quotation_id": null,
  "sales_order_id": 1,
  "contract_no": "CNT-2026-001",
  "customer_po_no": "PO-CUST-2026-001",
  "customer_po_date": "2026-09-01",
  "project_type": "mechanical",  //"electrical", "mechanical", "mep", "plumbing", "piping", "hvac", "fabrication", "installation", "erection", "commissioning", "maintenance", "turnkey", "other"
  "project_location": "Ahmedabad",
  "site_address": "GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat",
  "project_manager_id": 1,
  "project_engineer_id": 1,
  "start_date": "2026-09-10",
  "planned_end_date": "2027-03-31",
  "currency_id": 1,
  "contract_value": 2500000,
  "estimated_cost": 1850000,
  "description": "Complete mechanical installation project for industrial plant.",
  "terms_conditions": "Payment as per agreed project milestones.",
  "notes": "Customer requires weekly progress reports.",
  "status": "planning",  //"planning", "approved", "in_progress", "on_hold", "delayed", "completed", "closed", "cancelled"
  
  //add if project create with boq
  "boqItems": [
    {
      "boq_type": "material",   //'material', 'service', 'labour'
      "item_id": 2,
      "description": "MS Structural Steel",
      "quantity": 500,
      "unit_id": 1,
      "unit_rate": 85
    },
    {
      "boq_type": "material",
      "item_id": 3,
      "description": "Industrial Pipe",
      "quantity": 250,
      "unit_id": 1,
      "unit_rate": 450
    },
    {
      "boq_type": "labour",
      "item_id": null,
      "description": "Mechanical Installation Labour",
      "quantity": 100,
      "unit_id": 2,
      "unit_rate": 1200
    }
  ],

//add if project create with budget cost
  "costBudget": [
    {
      "category": "material",
      "budget_amount": 1000000,
      "actual_amount": 0,
      "remarks": "Material procurement budget"
    },
    {
      "category": "labour",
      "budget_amount": 400000,
      "actual_amount": 0,
      "remarks": "Installation labour"
    },
    {
      "category": "equipment",
      "budget_amount": 150000,
      "actual_amount": 0,
      "remarks": "Crane and equipment"
    },
    {
      "category": "subcontract",
      "budget_amount": 200000,
      "actual_amount": 0,
      "remarks": "Subcontractor work"
    },
    {
      "category": "other",
      "budget_amount": 100000,
      "actual_amount": 0,
      "remarks": "Other project expenses"
    }
  ],

//add if project create with milestones
  "milestones": [
    {
      "milestone_name": "Material Procurement Completed",
      "due_date": "2026-10-15",
      "payment_percent": 20,
      "payment_amount": 500000,
      "sort_order": 1,
      "status": "pending",    //'pending', 'in_progress', 'completed', 'invoiced'
      "remarks": "All major materials received"
    },
    {
      "milestone_name": "Mechanical Installation Completed",
      "due_date": "2027-01-15",
      "payment_percent": 50,
      "payment_amount": 1250000,
      "sort_order": 2,
      "status": "pending",
      "remarks": "Installation and erection completed"
    },
    {
      "milestone_name": "Testing and Commissioning",
      "due_date": "2027-03-15",
      "payment_percent": 30,
      "payment_amount": 750000,
      "sort_order": 3,
      "status": "pending",
      "remarks": "Final testing and commissioning"
    }
  ]
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project | add |
| company | tbl_project_boq_items | add |
| company | tbl_project_costs | add |
| company | tbl_project_milestones | add |
| company | tbl_sales_order | UPDATE → project_id |
| company | audit_logs | add |

### → CREATE PROJECT FROM SALES ORDER

http://localhost:4500/api/project/from-sales-order/:salesOrderId

POST

NOTES :  The Sales Order must already have: status = approved or confirmed

```jsx
{
  "project_name": "Ahmedabad Factory Expansion Project",
  "contract_no": "CNT-2026-002",
  "project_type": "turnkey",
  "project_location": "Ahmedabad",
  "site_address": "GIDC Industrial Estate, Ahmedabad, Gujarat",
  "project_manager_id": 1,
  "project_engineer_id": 1,
  "start_date": "2026-09-15",
  "planned_end_date": "2027-06-30",
  "estimated_cost": 3200000,
  "description": "Project automatically created from approved Sales Order.",
  "notes": "Execution will start after site handover."
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project | add |
| company | tbl_project_boq_items | add |
| company | tbl_sales_order | UPDATE → project_id |
| company | audit_logs | add |

### → UPDATE PROJECT

http://localhost:4500/api/project/:projectId 

PUT

```jsx
{
  "project_name": "Updated Industrial Plant Project",
  "party_id": 5,
  "quotation_id": 12,
  "sales_order_id": 20,
  "contract_no": "CON-2026-001",
  "customer_po_no": "PO-2026-045",
  "customer_po_date": "2026-09-15",
  "project_type": "industrial",
  "project_location": "Surat",
  "site_address": "Sachin GIDC, Surat",
  "project_manager_id": 2,
  "project_engineer_id": 3,
  "start_date": "2026-10-01",
  "planned_end_date": "2027-03-31",
  "actual_end_date": null,
  "currency_id": 1,
  "contract_value": 25000000,
  "estimated_cost": 19000000,
  "actual_cost": 12000000,
  "progress_percent": 55,
  "description": "Updated project description",
  "terms_conditions": "Updated terms",
  "notes": "Updated project notes"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project | UPDATE |
| company | audit_logs | add |

### → DELETE PROJECT

http://localhost:4500/api/project/:projectId 

DELETE

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project | update → is_deleted |
| company | tbl_project_boq_items | update → is_deleted |
| company | tbl_project_costs | update → is_deleted |
| company | tbl_project_milestones | update → is_deleted |
| company | tbl_project_tasks | update → is_deleted |
| company | tbl_project_sites | update → is_deleted |
| company | audit_logs | add |

### → CHANGE PROJECT STATUS

http://localhost:4500/api/project/:projectId/status/:status 

POST

| CURRENT STATUS | ALLOWED STATUS |
| --- | --- |
| planning | approved , cancelled |
| approved | in_progress , cancelled |
| in_progress | on_hold , delayed , completed , cancelled |
| on_hold | in_progress , cancelled |
| delayed | in_progress , completed , cancelled |
| completed | closed |
| closed |  |
| cancelled |  |

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project | update → status |
| company | audit_logs | add |

### → GET PROJECT FINANCIAL COST

GET

http://localhost:4500/api/project/:projectId/financials 

```jsx
//JSON RESPONSE
{
  "success": true,
  "message": "Project Financials",
  "financials": {
    "project_id": 2,
    "project_code": "PROJ/00002",
    "contract_value": 2500000,
    "estimated_cost": 1850000,
    "actual_cost": 350000,
    "cost_variance": -1500000,
    "billed_amount": 0,
    "received_amount": 0,
    "outstanding_amount": 0,
    "expected_profit": 650000,
    "current_profit": 2150000,
    "progress_percent": 25
  }
}
```

### → ADD PROJECT SITES

POST 

http://localhost:4500/api/project/:projectId/sites

```jsx
{
  "site_name": "Main Factory Site",
  "address_line1": "Sachin GIDC",
  "city_id": 10,
  "state_id": 7,
  "country_id": 1,
  "pincode": "394230",
  "contact_person": "Rajesh Patel",
  "contact_phone": "9876543210"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_sites | add |
| company | audit_logs | add |

### → DELETE PROJECT SITES

DELETE

http://localhost:4500/api/project/:projectId/sites/:siteId

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_sites | update → status |
| company | audit_logs | add |

### → ADD PROJECT BOQ

POST 

http://localhost:4500/api/project/:projectId/boq

```jsx
{
  "boq_type": "material",    //'material', 'service', 'labour'
  "item_id": 1,
  "description": "Structural Steel",
  "quantity": 100,
  "unit_id": 1,
  "unit_rate": 85000
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_boq_items | add |
| company | audit_logs | add |

### → UPDATE PROJECT BOQ

POST 

http://localhost:4500/api/project/:projectId/boq/:boqId

```jsx
{
  "boq_type": "material",
  "item_id": 2,
  "description": "Structural Steel",
  "quantity": 100,
  "unit_id": 1,
  "unit_rate": 85000,
  "consumed_quantity": 10
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_boq_items | update |

### → DELETE PROJECT BOQ

DELETE

http://localhost:4500/api/project/:projectId/boq/:boqItemId

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_boq_items | update → status |
| company | audit_logs | add |

### → ADD PROJECT MILESTONES

POST 

http://localhost:4500/api/project/:projectId/milestones

```jsx
{
  "milestone_name": "Foundation Completion",
  "due_date": "2026-11-30",
  "payment_percent": 20,
  "payment_amount": 5000000,
  "sort_order": 1,
  "status": "pending",
  "remarks": "TEsting foundation completion"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_milestones | add |
| company | audit_logs | add |

### → UPDATE PROJECT MILESTONES

POST 

http://localhost:4500/api/project/:projectId/milestones/:milestoneId

```jsx
{
  "milestone_name": "Foundation Completion",
  "due_date": "2026-11-30",
  "completion_date": "2026-11-30",
  "payment_percent": 20,
  "payment_amount": 5000000,
  "sort_order": 1,
  "status": "pending",
  "remarks": "TEsting foundation completion"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_milestones | update |

### → DELETE PROJECT MILESTONES

DELETE

http://localhost:4500/api/project/:projectId/milestones/:milestoneId

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_milestones | update → status |
| company | audit_logs | add |

### → ADD PROJECT TASKS

POST 

http://localhost:4500/api/project/:projectId/tasks

```jsx
{
  "site_id": 1,
  "task_name": "Foundation Excavation",
  "assigned_to": 2,
  "start_date": "2026-10-05",
  "due_date": "2026-10-15",
  "priority": "high",
  "progress_percent": 0,
  "status": "pending",
  "remarks": "remarks test"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_tasks | add |
| company | audit_logs | add |

### → UPDATE PROJECT TASKS

POST 

http://localhost:4500/api/project/:projectId/tasks/:taskId

```jsx
{
  "site_id": 1,
  "task_name": "Foundation Excavation",
  "assigned_to": 2,
  "start_date": "2026-10-05",
  "due_date": "2026-10-15",
  "priority": "high",
  "progress_percent": 0,
  "status": "pending",
  "remarks": "remarks test"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_tasks | update |

### → DELETE PROJECT TASKS

DELETE

http://localhost:4500/api/project/:projectId/tasks/:taskId

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_tasks | update → status |
| company | audit_logs | add |

### → GET DAILY PROGRESS REPORT(DPR)

GET  http://localhost:4500/api/projects/:projectId/dpr

### → CREATE DAILY PROGRESS REPORT(DPR)

POST  http://localhost:4500/api/projects/:projectId/dpr

```jsx
{
  "site_id": 1,
  "report_date": "2026-09-23",
  "weather": "Sunny",
  "manpower_count": 35,
  "equipment_used": "Excavator, Crane, Concrete Mixer",
  "work_completed": "Foundation excavation completed for Block A",
  "material_used": "Cement 150 bags, Steel 2 tons",
  "material_shortage": "Additional steel required",
  "work_planned_next": "Start foundation reinforcement",
  "progress_percent": 30,
  "issues": "Minor material delivery delay",
  "safety_issues": "No safety incident",
  "client_instructions": "Complete reinforcement by Friday",
  "remarks": "Site work progressing normally"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_dpr | add |
| company | tbl_project | if(progress_percent ! = undefined) 
update → progress_percent |
| company | audit_logs | add |

### → GET & CREATE PROJECT DOCUMENTS

GET http://localhost:4500/api/projects/:projectId/documents

POST  http://localhost:4500/api/projects/:projectId/documents

The example payload below repeats the DPR fields and should be replaced with the
document metadata fields supported by the backend (for example, a site reference
and document/file metadata) before treating it as the authoritative upload schema.

```jsx
{
  "site_id": 1,
  "report_date": "2026-09-23",
  "weather": "Sunny",
  "manpower_count": 35,
  "equipment_used": "Excavator, Crane, Concrete Mixer",
  "work_completed": "Foundation excavation completed for Block A",
  "material_used": "Cement 150 bags, Steel 2 tons",
  "material_shortage": "Additional steel required",
  "work_planned_next": "Start foundation reinforcement",
  "progress_percent": 30,
  "issues": "Minor material delivery delay",
  "safety_issues": "No safety incident",
  "client_instructions": "Complete reinforcement by Friday",
  "remarks": "Site work progressing normally"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_documents | add |
| company | audit_logs | add |

### → DELETE PROJECT DOCUMENTS

DELETE  http://localhost:4500/api/projects/:projectId/documents/:documentId

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_documents | update → status |
| company | audit_logs | add |

---

## PROCUREMENT ROUTES:—

### → GET REQUISITIONS

GET 

http://localhost:4500/api/procurement/requisition

http://localhost:4500/api/procurement/requisition/:requisitionId

### → CREATE REQUISITIONS

POST

http://localhost:4500/api/procurement/requisition

```jsx
{
  "project_id": 3,
  "requisition_date": "2026-09-21",
  "required_by": "2026-09-30",
  "notes": "Material required for construction work",
  "itemsDetails": [
    {
      "item_id": 2,
      "description": "Cement OPC 53 Grade",
      "quantity": 100,
      "unit_id": 1,
      "notes": "Required for foundation work"
    },
    {
      "item_id": 3,
      "description": "TMT Steel 12mm",
      "quantity": 500,
      "unit_id": 1,
      "notes": "Required for RCC work"
    }
  ]
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | purchase_requisitions | add |
| company | purchase_requisition_items | add |
| company | audit_logs | add |

### → CHANGE REQUISITIONS STATUS

POST

http://localhost:4500/api/procurement/requisition/:requisitionId/:status

| CURRENT STATUS | ALLOWED STATUS |
| --- | --- |
| draft | approved , cancelled |
| approved | cancelled |
| cancelled |  |

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | purchase_requisitions | update → status |
| company | audit_logs | add |

### → GET GRN

GET 

http://localhost:4500/api/procurement/grn

http://localhost:4500/api/procurement/grn/:grnId

### → CREATE DIRECT GRN

POST

http://localhost:4500/api/procurement/grn

```jsx
{
  "purchase_order_id": 1,
  "warehouse_id": 1,
  "grn_date": "2026-09-21",
  "notes": "Material received from supplier",
  "itemsDetails": [
    {
      "purchase_order_item_id": 1,
      "item_id": 2,
      "batch_id": null,
      "quantity": 50,
      "unit_id": 1,
      "rate": 350
    },
    {
      "purchase_order_item_id": 2,
      "item_id": 3,
      "batch_id": null,
      "quantity": 100,
      "unit_id": 1,
      "rate": 75
    }
  ]
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | goods_receipts | add |
| company | goods_receipt_items | add |
| company | audit_logs | add |

### → CHANGE GRN STATUS

POST

http://localhost:4500/api/procurement/grn/:grnId/:status

| CURRENT STATUS | ALLOWED STATUS |
| --- | --- |
| draft | approved , cancelled |
| approved | cancelled |
| cancelled |  |

| DB NAME | TABLE NAME | ACTION | IF STATUS IS  |
| --- | --- | --- | --- |
| company | stock_ledger | add (IN STOCK) | APPROVED |
| company | goods_receipts | update → status | APPROVED  or  CANCELLED |
| company | tbl_purchase_orders | update → status | APPROVED |
| company | audit_logs | add | APPROVED  or  CANCELLED |

IF STATUS IS APPROVED

1. Checks GRN has items
2. Validates received quantity against PO quantity
3. Creates `IN` entries in `stock_ledger`
4. Changes GRN to `approved`
5. Updates the Purchase Order status

### →  GET SITE ISSUE

GET

http://localhost:4500/api/procurement/site-issue

http://localhost:4500/api/procurement/site-issue/:issueId

### → CREATE SITE ISSUE

POST

http://localhost:4500/api/procurement/site-issue

CONDITIONS:

- Approved/in-progress project
- Site belonging to that project
- Active warehouse
- Active item
- Available stock

```jsx
{
  "project_id": 3,
  "site_id": 1,         //REFERNCE FORM PROJECT-SITES
  "warehouse_id": 1,
  "issue_date": "2026-09-21",
  "notes": "Material issued for site construction",
  "itemsDetails": [
    {
      "item_id": 2,
      "batch_id": null,    //REFERNCE FORM ITEM BATCHES
      "quantity": 20,
      "unit_id": 1,
      "boq_item_id": 4       //REFERNCE FORM PROJECT BOQ
    },
    {
      "item_id": 3,
      "batch_id": null,
      "quantity": 50,
      "unit_id": 1,
      "boq_item_id": 5       //REFERNCE FORM PROJECT BOQ
    }
  ]
}
```

### → CHANGE SITE ISSUE STATUS

POST

http://localhost:4500/api/procurement/site-issue/:issueId/:status

| CURRENT STATUS | ALLOWED STATUS |
| --- | --- |
| draft | approved , cancelled |
| approved | cancelled |
| cancelled |  |

| DB NAME | TABLE NAME | ACTION | IF STATUS IS  |
| --- | --- | --- | --- |
| company | stock_ledger | add (IN STOCK) | APPROVED |
| company | site_issues | update → status | APPROVED  or  CANCELLED |
| company | tbl_project_boq_items | update → consumed_quantity | APPROVED |
| company | audit_logs | add | APPROVED  or  CANCELLED |

---

# lead module

GET

http://localhost:4500/api/lead 

http://localhost:4500/api/lead/:leadId

POST      http://localhost:4500/api/lead

```jsx
{
  "company_name": "Shreeji Engineering Pvt Ltd",
  "contact_name": "priyanshi Patel",
  "designation": "Purchase Manager",
  "phone": "8796541323",
  "email": "priyanshi@gmail.com",
  "website": "https://www.shreejiengineering.com",
  "gst_no": "24AABCS1234F1Z5",
  "industry_id": "",
  "lead_source_id": 1,
  "referred_by": "abc",
  "address_line1": "Plot 45, GIDC Industrial Estate",
  "address_line2": "Phase 1",
  "city_id": 1,
  "state_id": 7,
  "country_id": 1,
  "pincode": "380001",
  "assigned_to": 2,
  "rating": "cold",
  "estimated_value": 1250000.00,
  "next_follow_up_date": "2026-10-05",
  "last_contacted_at": "2026-10-01 10:30:00",
  "status": "new",
  "lost_reason": "",
  "party_id": "",
  "converted_at": "",
  "notes": "Interested in annual ERP and inventory management package."
}
```

| DB NAME | TABLE NAME | ACTION for create | ACTION for update |
| --- | --- | --- | --- |
| company | tbl_lead | add | update |
| company | audit_logs | add | add |

PUT      http://localhost:4500/api/lead/:leadId

```jsx
SAME AS CREATE DATA AND DATABASE
```

DELETE      http://localhost:4500/api/lead/:leadId

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_lead | UPDATE → is_deleted |
| company | tbl_crm_activity | UPDATE → is_deleted |
| company | audit_logs | add |

POST    http://localhost:4500/api/lead/:leadId/status/:status 

| CURRENT STATUS | ALLOWED STATUS |
| --- | --- |
| new | "contacted", "qualified", "lost" |
| contacted | "qualified", "lost” |
| qualified | "contacted", "lost” |
| lost | new            // reopen |
| converted |  |

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_lead | UPDATE → status, lost_reason, next_follow_up_date |
| company | audit_logs | add |

POST    http://localhost:4500/api/lead/:leadId/convert 

```jsx

```

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_party | add |
| company | tbl_party_addresses | add |
| company | tbl_party_contact_person | add |
| company | tbl_lead | UPDATE → status, party_id, lost_reason, converted_at, next_follow_up_date |
| company | tbl_enquiry | update → party_id |
| company | audit_logs | add |