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
| company | tbl_project_boq_items | update → is_deleted |
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
| company | tbl_project_milestones | update → is_deleted |
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
| company | tbl_project_tasks | update → is_deleted |
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

## MENPOWER ROUTES:—

→ TRADES CREATE AND GET

GET & POST

http://localhost:4500/api/manpower/trades 

```jsx
{
  "trade_name": "Electrician"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | labour_trade_mst | add |
| company | audit_logs | add |

→ MANPOWER LOGS

Fillter by dates and trade id 

GET http://localhost:4500/api/manpower/5/logs?from=2026-10-01&to=2026-10-07&tradeId=1

GET & POST

http://localhost:4500/api/manpower/:projectId/logs      

```jsx
{
  "log_date": "2026-10-07",
  "trade_id": 1,
  "headcount": 5,
  "regular_hours": 8,
  "overtime_hours": 2,
  "rate_per_hour": 300,
  "ot_rate_per_hour": 450,
  "subcontractor_id": 10,
  "site_id": 3,
  "remarks": "Electrical installation work"
}
```

| Field | Required | Example | Meaning |
| --- | --- | --- | --- |
| `log_date` | Yes | `2026-10-07` | Work date |
| `trade_id` | Yes | `1` | Labour trade |
| `headcount` | Yes | `5` | Number of workers |
| `regular_hours` | No | `8` | Normal working hours |
| `overtime_hours` | No | `2` | OT hours |
| `rate_per_hour` | Yes | `300` | Normal hourly rate |
| `ot_rate_per_hour` | No | `450` | Overtime hourly rate |
| `subcontractor_id` | No | `10` | Subcontractor/party |
| `site_id` | No | `3` | Project site |
| `remarks` | No | `"Electrical installation work"` | Notes |

### How the cost is calculated

For example:

```
Headcount       = 5
Regular hours   = 8
Overtime        = 2
Regular rate    = ₹300
OT rate         = ₹450
```

Conceptually:

```
Regular Cost
= 5 × 8 × ₹300
= ₹12,000
```

```
Overtime Cost
= 5 × 2 × ₹450
= ₹4,500
```

```
Total Labour Cost
= ₹12,000 + ₹4,500
= ₹16,500
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_manpower_log | add |
| company | tbl_project_costs | add |
| company | tbl_project | update → actual_cost |
| company | audit_logs | add |

PUT & DELETE 

http://localhost:4500/api/manpower/:projectId/logs/:manpowerLogId  

```jsx
// For update
{
  "headcount": 7,
  "regular_hours": 8,
  "overtime_hours": 2,
  "rate_per_hour": 350,
  "ot_rate_per_hour": 500,
  "remarks": "Updated electrical installation work"
}
```

| DB NAME | TABLE NAME | ACTION |
| --- | --- | --- |
| company | tbl_project_manpower_log | update |
| company | tbl_project_costs | add |
| company | tbl_project | update → actual_cost |
| company | audit_logs | add |

---

## EQUIPMENT ROUTES:—

→ GET EQUIEMENT

http://localhost:4500/api/equipment

http://localhost:4500/api/equipment/:equipmentId 

filter by : status, type, search

http://localhost:4500/api/equipment?status=active&type=crane&search=Tower

→ CREATE EQUIPMENT

POST   http://localhost:4500/api/equipment

```jsx
{
  "equipment_name": "Diesel Forklift",
  "equipment_type": "forklift",
  "ownership": "rented",
  "vendor_id": 10,   //OPTIONAL
  "rate_per_hour": 1200,
  "rate_per_day": 8500,
  "status": "active",
  "notes": "Material handling"
}
```

→ UPDATE EQUIPMENT

PUT   http://localhost:4500/api/equipment/:equipmentId 

```jsx
{
  "equipment_name": "Tower Crane Updated",
  "rate_per_hour": 2800,
  "rate_per_day": 20000,
  "notes": "Updated crane rate"
}
```

DELETE   http://localhost:4500/api/equipment/:equipmentId

first check equipment log are exits or not if exits then get message “This equipment has ____ usage log(s). Remove those first”. table: tbl_project_equipment_log

| DB NAME | TABLE NAME | ACTION for create | ACTION for update | ACTION for delete |
| --- | --- | --- | --- | --- |
| company | equipment_mst | add | update | update → is_deleted |
| company | audit_logs | add | add | add |

→ EQUIPMENT LOG

GET

 http://localhost:4500/api/equipment/project/:projectId/logs 

FILTER BY : from, to, equipmentId

http://localhost:4500/api/equipment/project/5/logs?from=2026-10-01&to=2026-10-31&equipmentId=1

POST

 http://localhost:4500/api/equipment/project/:projectId/logs 

```jsx
{
  "equipment_id": 1,
  "site_id": 3,
  "log_date": "2026-10-07",
  "hours_used": 8,
  "rate_per_hour": 2500,
  "fuel_cost": 1500,
  "operator_name": "Ramesh Patel",
  "remarks": "Tower crane used for structural lifting"
}
```

### Equipment Cost Calculation

Your `computeEquipmentCost()` does:

```
(hours_used × rate_per_hour) + fuel_cost
```

For example:

```
Hours Used       = 8
Rate Per Hour    = ₹2,500
Fuel Cost        = ₹1,500
```

Calculation:

```
8 × ₹2,500 = ₹20,000

₹20,000 + ₹1,500
           ↓
Equipment Cost = ₹21,500
```

Your service rounds the result to 2 decimal places.

→ UPDATE

PUT http://localhost:4500/api/equipment/project/:projectId/logs/:equipmentLogId 

```jsx
{
  "equipment_id": 1,
  "site_id": 3,
  "log_date": "2026-10-07",
  "hours_used": 10,
  "rate_per_hour": 2800,
  "fuel_cost": 2000,
  "operator_name": "Ramesh Patel",
  "remarks": "Updated equipment usage for structural lifting"
}
```

→ DELETE EQUIPMENT LOG

DELETE  http://localhost:4500/api/equipment/project/:projectId/logs/:equipmentLogId

| DB NAME | TABLE NAME | ACTION for create | ACTION for UPDATE | ACTION  for delete |
| --- | --- | --- | --- | --- |
| company | tbl_project_equipment_log | add | update | update → is_deleted |
| company | tbl_project_costs | add | add | add |
| company | tbl_project | update → actual_cost | update → actual_cost | update → actual_cost |
| company | audit_logs | add | add | add |

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

#### ENQUIRY

GET  

 http://localhost:4500/api/enquiry

 http://localhost:4500/api/enquiry/:enquiryId 

GET ENQUIRIES WITH FILTERS

all querys :  status, partyId, leadId, assignedTo, priority, search, openOnly, dueWithinDays, tender, sort 

POST

 http://localhost:4500/api/enquiry

CREATE INQUIRY WITH LEAD ID

```jsx
{
  "lead_id": 1,
  "enquiry_date": "2026-10-06",
  "enquiry_title": "Industrial Warehouse Construction",
  "project_type": "industrial",
  "customer_ref_no": "RFQ-2026-001",
  "plant_name": "Ahmedabad Manufacturing Plant",
  "project_location": "Ahmedabad, Gujarat",
  "site_address": "Sanand Industrial Estate, Ahmedabad, Gujarat",
  "scope_of_work": "Civil construction, structural work, roofing and electrical work",
  "is_tender": true,
  "tender_no": "TENDER-2026-001",
  "submission_due_date": "2026-10-20",
  "prebid_meeting_date": "2026-10-10",
  "emd_amount": 50000,
  "site_visit_required": true,
  "site_visit_date": "2026-10-08",
  "expected_start_date": "2026-11-01",
  "expected_end_date": "2027-05-31",
  "currency_id": 1,
  "estimated_value": 25000000,
  "priority": "high",
  "assigned_to": 5,
  "estimator_id": 7,
  "next_follow_up_date": "2026-10-09",
  "notes": "Customer requires detailed BOQ and commercial quotation."
}
```

Create Enquiry directly from Customer

```jsx
{
  "party_id": 10,
  "enquiry_date": "2026-10-06",
  "enquiry_title": "Factory Expansion Project",
  "project_type": "commercial",
  "customer_ref_no": "CUST-RFQ-102",
  "project_location": "Vadodara, Gujarat",
  "site_address": "GIDC Industrial Area, Vadodara",
  "scope_of_work": "Factory building expansion and civil works",
  "is_tender": false,
  "site_visit_required": true,
  "site_visit_date": "2026-10-09",
  "expected_start_date": "2026-11-15",
  "expected_end_date": "2027-03-31",
  "currency_id": 1,
  "estimated_value": 12000000,
  "priority": "medium",
  "assigned_to": 5,
  "estimator_id": 7,
  "next_follow_up_date": "2026-10-12",
  "notes": "Existing customer requesting factory expansion."
}
```

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company  | tbl_enquiry | add |
| company | tbl_lead | UPDATE → status=qualified |
| company | audit_logs | add |

PUT

 http://localhost:4500/api/enquiry/:enquiryId 

```jsx
{
  "enquiry_title": "Updated Industrial Warehouse Construction",
  "priority": "high",
  "estimated_value": 28000000,
  "site_visit_required": true,
  "site_visit_date": "2026-10-10",
  "expected_start_date": "2026-11-15",
  "expected_end_date": "2027-06-30",
  "next_follow_up_date": "2026-10-12",
  "notes": "Customer increased project scope. Revised estimation required."
}
```

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_enquiry | UPDATE |
| company | audit_logs | add |

DELETE

 http://localhost:4500/api/enquiry/:enquiryId 

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_enquiry | update → is_deleted |
| company | tbl_crm_activity | update → is_deleted |
| company | tbl_enquiry_documents | update → is_deleted |
| company | audit_logs | add |

POST

CHANGE STATUS

 http://localhost:4500/api/enquiry/:enquiryId/status/:status 

```jsx
//IF STATUS SET AS A LOST
{
  "lost_reason": "Customer selected another contractor due to lower price",
  "competitor_name": "ABC Construction Pvt Ltd"
}
```

| CURRENT STATUS | ALLOWED STATUS |
| --- | --- |
| new | "under_review", "site_visit", "estimating", "no_bid", "on_hold", "cancelled” |
| under_review | "site_visit", "estimating", "no_bid", "on_hold", "cancelled” |
| site_visit | "estimating", "no_bid", "on_hold", "cancelled” |
| estimating | "quoted", "no_bid", "on_hold", "cancelled” |
| quoted | "estimating", "negotiation", "won", "lost", "on_hold", "cancelled" |
| negotiation | "quoted", "won", "lost", "on_hold", "cancelled” |
| on_hold | "under_review", "estimating", "cancelled” |
| lost | under_review |
| no_bid | under_review |
| won |  |
| cancelled |  |

POST

LINK QUOTAION

http://localhost:4500/api/enquiry/:enquiryId/link-quotation/:quotationId 

which verifies:

1. Enquiry exists.
2. Quotation exists.
3. Quotation isn't already linked to another enquiry.
4. Enquiry belongs to a customer.
5. Quotation customer matches enquiry customer.
6. Enquiry isn't closed.
7. Quotation is then linked.
8. Enquiry can automatically become `quoted`.

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_quotation | UPDATE → enquiry_id |
| company | tbl_enquiry | UPDATE → status = 'quoted’ |
| company | audit_logs | add |

ENQUIRY ACTIVITY

GET & POST

http://localhost:4500/api/enquiry/:enquiryId/activities 

```jsx
{
  "activity_type": "call",
  "activity_date": "2026-10-06",
  "subject": "Customer requirement discussion",
  "outcome": "Customer confirmed project requirements and requested quotation.",
  "next_follow_up_date": "2026-10-10"
}
```

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_crm_activity | add |
| company | audit_logs | add |

ENQUIRY DOCUMENTS

GET & POST

http://localhost:4500/api/enquiry/:enquiryId/documents  

```jsx
{
  "document_type": "rfq",
  "document_name": "Customer_RFQ_001.pdf",
  "file_url": "https://example.com/files/Customer_RFQ_001.pdf",
  "remarks": "Original RFQ received from customer."
}
```

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_enquiry_documents | add |
| company | audit_logs | add |

DELETE

http://localhost:4500/api/enquiry/:enquiryId/documents/:documentId 

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | tbl_enquiry_documents | update → is_deleted |
| company | audit_logs | add |

---

# HRMS MODULES :—

→BEFORE CREATE HRMS ADD SOME MASTER DATA

```jsx
INSERT INTO departments
    (department_name, is_deleted, user_id, company_id)
VALUES
    ('Human Resources', FALSE, 1, 1),
    ('Information Technology', FALSE, 1, 1),
    ('Sales & Marketing', FALSE, 1, 1),
    ('Purchase & Procurement', FALSE, 1, 1),
    ('Accounts & Finance', FALSE, 1, 1),
    ('Project Management', FALSE, 1, 1),
    ('Warehouse & Inventory', FALSE, 1, 1),
    ('Administration', FALSE, 1, 1),
    ('Operations', FALSE, 1, 1),
    ('Customer Relationship Management', FALSE, 1, 1),
    ('Production', FALSE, 1, 1),
    ('Quality Control', FALSE, 1, 1),
    ('Maintenance', FALSE, 1, 1),
    ('Logistics', FALSE, 1, 1);
    

INSERT INTO designations
    (designation_name, department_id, status, is_deleted)
VALUES
    ('HR Manager',              1, 'active', FALSE),
    ('HR Executive',            1, 'active', FALSE),
    ('Recruitment Executive',   1, 'active', FALSE),

    ('Software Developer',      2, 'active', FALSE),
    ('Senior Software Developer', 2, 'active', FALSE),
    ('Software Engineer',       2, 'active', FALSE),
    ('Technical Lead',           2, 'active', FALSE),

    ('Sales Manager',            3, 'active', FALSE),
    ('Sales Executive',          3, 'active', FALSE),
    ('Business Development Executive', 3, 'active', FALSE),

    ('Purchase Manager',         4, 'active', FALSE),
    ('Purchase Executive',       4, 'active', FALSE),
    ('Procurement Executive',    4, 'active', FALSE),

    ('Account Manager',          5, 'active', FALSE),
    ('Accountant',               5, 'active', FALSE),
    ('Senior Accountant',        5, 'active', FALSE),

    ('Project Manager',          6, 'active', FALSE),
    ('Project Engineer',         6, 'active', FALSE),
    ('Site Engineer',            6, 'active', FALSE),
    ('Site Supervisor',          6, 'active', FALSE),

    ('Warehouse Manager',        7, 'active', FALSE),
    ('Store Keeper',             7, 'active', FALSE),
    ('Inventory Executive',     7, 'active', FALSE),

    ('Admin Manager',            8, 'active', FALSE),
    ('Admin Executive',          8, 'active', FALSE),
    ('Office Administrator',     8, 'active', FALSE),

    ('Operations Manager',       9, 'active', FALSE),
    ('Operations Executive',     9, 'active', FALSE),

    ('IT Manager',              10, 'active', FALSE),
    ('IT Support Executive',    10, 'active', FALSE);
    
    
INSERT INTO branch_mst
    (branch_name, city_id, status, is_deleted, user_id)
VALUES
    ('Head Office', 1, 'active', FALSE, 1),
    ('Ahmedabad Branch', 1, 'active', FALSE, 1),
    ('Surat Branch', 2, 'active', FALSE, 1),
    ('Vadodara Branch', 3, 'active', FALSE, 1),
    ('Rajkot Branch', 4, 'active', FALSE, 1),
    ('Gandhinagar Branch', 5, 'active', FALSE, 1);
    
    
INSERT INTO shift_master
    (shift_name, start_time, end_time, status, is_deleted)
VALUES
    ('General Shift', '09:00:00', '18:00:00', 'active', FALSE),
    ('Morning Shift', '06:00:00', '14:00:00', 'active', FALSE),
    ('Evening Shift', '14:00:00', '22:00:00', 'active', FALSE),
    ('Night Shift',   '22:00:00', '06:00:00', 'active', FALSE),
    ('Flexible Shift', '10:00:00', '19:00:00', 'active', FALSE),
    ('Half Day Shift', '09:00:00', '13:00:00', 'active', FALSE);   
 
```

## → EMPLOYEE CRUD

→ CREATE EMPLOYEE

PERMISSION : hrms_employee:create

POST   http://localhost:4500/api/hrms/employees

```jsx
{
  "firstName": "Rahul",
  "lastName": "Patel",
  "email": "rahul.patel@example.com",
  "phone": "9876543210",
  "gender": "male",
  "dateOfBirth": "1995-05-15",
  "joiningDate": "2026-10-01",
  "employmentType": "full_time",
  "status": "active",
  "departmentId": 1,   //REFERENCE FROM DEPARTMENT MASTER
  "designationId": 1,    //REFERENCE FROM DESIGNATION MASTER
  "branchId": 1,
  "shiftId": 1,
  "managerUserId": 1,
  "workLocation": "Ahmedabad Office",
  "addressLine1": "SG Highway",
  "cityId": 1,
  "stateId": 7,
  "countryId": 1,
  "pincode": "380001",
  "emergencyContactName": "Amit Patel",
  "emergencyContactPhone": "9876501234",
  "bankName": "HDFC Bank",
  "bankAccountNo": "501234567890",
  "ifscCode": "HDFC0001234",
  "taxId": "ABCDE1234F"
}
```

→ LIST EMPLOYESS

PERMISSION : hrms_employee:view

GET http://localhost:4500/api/hrms/employees

FILTTERS BY :  `status`, `departmentId`, and `search` filters.
GET http://localhost:4500/api/hrms/employees?status=active&departmentId=1&search=Rahul

→ GET SINGLE EMPLOYEE

GET http://localhost:4500/api/hrms/employees/:employeeId

→ UPDATE EMPLOYEE

PERMISSION : hrms_employee:update

PUT  http://localhost:4500/api/hrms/employees/:employeeId

```jsx
{
  "firstName": "Rahul",
  "lastName": "Patel",
  "gender": "male",
  "dateOfBirth": "1995-05-15",
  "joiningDate": "2026-10-01",
  "employmentType": "full_time",
  "status": "active",
  "departmentId": 1,   //REFERENCE FROM DEPARTMENT MASTER
  "designationId": 1,    //REFERENCE FROM DESIGNATION MASTER
  "branchId": 1,
  "shiftId": 1,
  "managerUserId": 1,
  "workLocation": "Ahmedabad Office",
  "addressLine1": "SG Highway",
  "cityId": 1,
  "stateId": 7,
  "countryId": 1,
  "pincode": "380001",
  "emergencyContactName": "Amit Patel",
  "emergencyContactPhone": "9876501234",
  "bankName": "HDFC Bank",
  "bankAccountNo": "501234567890",
  "ifscCode": "HDFC0001234",
  "taxId": "ABCDE1234F"
}
```

→ DELETE/ Archive EMPLOYEE

PERMISSION : hrms_employee:delete

DELETE  http://localhost:4500/api/hrms/employees/1

| DB NAME | TABLE NAME | ACTION FOR CREATE | ACTION FOR UPDATE | ACTION FOR DELETE |
| --- | --- | --- | --- | --- |
| company | hrms_employees | ADD | UPDATE | update → is_delete, status |
| company | audit_logs | add | add | add |

## → ATTENDANCE

→Create Attendance

PERMISSION : hrms_attendance:create

POST http://localhost:4500/api/hrms/attendance

```jsx
{
  "employeeId": 1,
  "attendanceDate": "2026-10-08",
  "checkIn": "09:10",
  "checkOut": "18:15",
  "status": "present",
  "notes": "Regular attendance"
}
```

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | hrms_attendance | if exist employee_id  AND attendance_date then UPDATE else ADD |
| company | audit_logs | add (”UPDATE”) |

→ List Attendance

PERMISSION : hrms_attendance:view

GET http://localhost:4500/api/hrms/attendance

FILLTER BY: employeeId, fromDate, toDate, status

GET http://localhost:4500/api/hrms/attendance?employeeId=1&fromDate=2026-10-01&toDate=2026-10-08

GET http://localhost:4500/api/hrms/attendance?status=late

→ Attendance Alerts

PERMISSION : hrms_attendance:view

GET http://localhost:4500/api/hrms/attendance/alerts?date=2026-10-08&graceMinutes=10

The API checks for:

```
missing attendance
missing check-in
missing check-out
late check-in
```

The controller supports `date` and `graceMinutes`; grace minutes must be between 0 and 720.

## → LEAVE BALANCE

→ Create/Update Leave Balance

PERMISSION : hrms_leave_balance:update

PUT   http://localhost:4500/api/hrms/leave-balances/:employeeId 

```jsx
{
  "year": 2026,
  "leaveType": "casual",
  "openingDays": 5,
  "accruedDays": 10,
  "adjustedDays": 0
}

//CALCULATION : opening + accrued + adjusted - used
```

| DB NAME | TABLE NAME | ACTION  |
| --- | --- | --- |
| company | hrms_leave_balances | add |
| company | audit_logs | add (”UPDATE”) |

→ List Leave Balances

PERMISSION : hrms_leave_balance:view

GET http://localhost:4500/api/hrms/leave-balances

FILLTER BY : employeeId and year

GET http://localhost:4500/api/hrms/leave-balances?employeeId=1&year=2026

## → LEAVE REQUEST

→ Create Leave

PERMISSION :  hrms_leave:create

POST http://localhost:4500/api/hrms/leave-requests

```jsx
{
  "employeeId": 1,
  "leaveType": "casual",
  "startDate": "2026-10-15",
  "endDate": "2026-10-16",
  "reason": "Personal work"
}
```

→ List Leave Requests

PERMISSION : hrms_leave:view

GET http://localhost:4500/api/hrms/leave-requests

GET http://localhost:4500/api/hrms/leave-requests?employeeId=1

GET http://localhost:4500/api/hrms/leave-requests?status=pending

→ Approve / Reject Leave

PERMISSION : hrms_leave:update

PUT http://localhost:4500/api/hrms/leave-requests/:leaveId 

```jsx
{
  "status": "approved",  //pending, approved, rejected, cancelled
  "remarks": "Leave approved by HR"
}

```

| DB NAME | TABLE NAME | ACTION FOR CREATE | ACTION FOR APPROVE |
| --- | --- | --- | --- |
| company | hrms_leave_requests | add | update → status, approved_by, approved_at, remarks, updated_at |
| company | audit_logs | add  | add  |

## → OVERTIME REQUEST

→ Create Overtime Request

PERMISSION : hrms_overtime:create 

POST   http://localhost:4500/api/hrms/overtime-requests

```jsx
{
  "employeeId": 1,
  "workDate": "2026-10-08",
  "hours": 3,   // VALID: hours > 0, hours <= 24
  "hourlyRate": 500,   //VALID : hourlyRate >= 0
  "reason": "Completed urgent client work"
}

```

→ List Overtime

PERMISSION : 

GET http://localhost:4500/api/hrms/overtime-requests

GET http://localhost:4500/api/hrms/overtime-requests?status=approved

→ Approve Overtime

PERMISSION : hrms_overtime:approve

PUT http://localhost:4500/api/hrms/overtime-requests/:requestId/review

```jsx
{
  "status": "approved",   // approved, rejected
  "remarks": "Approved by manager"
}
```

| DB NAME | TABLE NAME | ACTION FOR CREATE | ACTION FOR APPROVE |
| --- | --- | --- | --- |
| company | hrms_overtime_requests | add | update → status, approved_by, approved_at, remarks, updated_at |
| company | audit_logs | add  | add  |

## → DEDUCTION RULES

→ Create Deduction Rule

PERMISSION : hrms_payroll:create

POST http://localhost:4500/api/hrms/deduction-rules

```jsx
{
  "code": "RETIREMENT",
  "name": "Retirement Contribution",
  "calculationMethod": "percentage",  // fixed, percentage
  "calculationBasis": "basic_salary",   //basic_salary, gross_salary
  "rate": 8,  // IF fixed THEN VALUE IS LIKE 250
  "isStatutory": true,
  "isActive": true
}
```

→ List Deduction Rules

GET http://localhost:4500/api/hrms/deduction-rules

PERMISSION : hrms_payroll:view

→ Update Deduction Rule

PERMISSION : hrms_payroll:update

PUT http://localhost:4500/api/hrms/deduction-rules/:ruleId

```jsx
{
  "code": "RETIREMENT",
  "name": "Retirement Contribution",
  "calculationMethod": "fixed",
  "calculationBasis": "basic_salary",
  "rate": 1000,
  "isStatutory": true,
  "isActive": true
}
```

## → PAYROLL

→ Create Payroll

PERMISSION : hrms_payroll:create

POST http://localhost:4500/api/hrms/payroll

```jsx
{
  "payPeriodStart": "2026-10-01",
  "payPeriodEnd": "2026-10-31",
  "items": [
    {
      "employeeId": 1,
      "basicSalary": 50000,
      "allowances": 5000,
      "overtime": 0,
      "bonus": 2000,
      "otherEarnings": 1000,
      "deductions": 250
    }
  ]
}
```

→ **List Payroll Runs**

PERMISSION : hrms_payroll:view

GET http://localhost:4500/api/hrms/payroll

→ Approve Payroll

PERMISSION : hrms_payroll:approve

PUT http://localhost:4500/api/hrms/payroll/:payrollId/approve 

→ Get Payslip

This should be tested **after payroll approval**.

PERMISSION : hrms_payroll:view

GET  http://localhost:4500/api/hrms/payroll/:payrollId/payslips/:employeeId 

GET  http://localhost:4500/api/hrms/payroll/:payrollId/payslips/:employeeId.pdf 

## → EMPLOYEE DOCUMENTS

→ Add Document Metadata

PERMISSION : hrms_document:create

POST http://localhost:4500/api/hrms/employees/:employeeId/documents 

```jsx
{
  "documentType": "Aadhaar Card",
  "fileName": "rahul-aadhaar.pdf",
  "storageKey": "employees/1/documents/rahul-aadhaar.pdf",
  "issuedOn": "2024-01-15",
  "expiresOn": null
}
```

→ **List Employee Documents**

PERMISSION : hrms_document:view

GET http://localhost:4500/api/hrms/employees/:employeeId/documents

→ Delete Document

PERMISSION : **hrms_document:delete**

DELETE http://localhost:4500/api/hrms/documents/:documentId 

## → ONBOARDING TASK

→ **Create Onboarding Task**

POST http://localhost:4500/api/hrms/onboarding-tasks

PERMISSION : hrms_onboarding:create

```jsx
{
  "employeeId": 1,
  "title": "Submit Identity Documents",
  "description": "Submit Aadhaar, PAN and bank documents",
  "dueDate": "2026-10-10",
  "assignedTo": 1
}
```

→ List Onboarding Tasks

PERMISSION : hrms_onboarding:view

GET 

http://localhost:4500/api/hrms/onboarding-tasks

http://localhost:4500/api/hrms/onboarding-tasks?employeeId=1

→ Update Onboarding Task

PERMISSION : hrms_onboarding:update

PUT http://localhost:4500/api/hrms/onboarding-tasks/:taskId 

```jsx
{
  "status": "in_progress"   //pending, in_progress, completed, skipped
}
```

When status becomes `completed`, the controller automatically sets `completed_at`. 

## → SHIFT ROSTER

→Save Shift Roster

PERMISSION : hrms_roster:create

POST http://localhost:4500/api/hrms/rosters 

```jsx
{
  "employeeId": 1,
  "shiftId": 1,
  "rosterDate": "2026-10-08"
}
```

→ List Rosters

PERMISSION : hrms_roster:create

GET 

http://localhost:4500/api/hrms/rosters

http://localhost:4500/api/hrms/rosters?employeeId=1

http://localhost:4500/api/hrms/rosters?fromDate=2026-10-01&toDate=2026-10-31

## → PROJECT ASSIGNEMNET & TIMESHEETS

→ CREATE PROJECT ASSIGNMENT

POST   http://localhost:4500/api/hrms/project-assignments 

PERMISSION : hrms_project_assignment:create

```jsx
{
  "employeeId": 1,
  "projectId": 1,
  "siteId": 1,
  "startDate": "2026-10-01",
  "endDate": "2026-12-31",
  "hourlyRate": 250,
  "overtimeRate": 375
}
```

→ CLOSE PROJECT ASSIGNMENT

PERMISSION : hrms_project_assignment:update

PUT   http://localhost:4500/api/hrms/project-assignments/:assignmentId/close  

```jsx
{
  "endDate": "2026-10-14"
}
```

→ LIST PROJECT ASSIGNMENT

PERMISSION : hrms_project_assignment:view

GET 

http://localhost:4500/api/hrms/project-assignments

FILLTER BY:  employeeId, projectId,  status = 'active', 'closed', 'cancelled’

http://localhost:4500/api/hrms/project-assignments?employeeId=1&projectId=1&status=active

→ Create project timesheet

PERMISSION : hrms_project_timesheet:create

POST   http://localhost:4500/api/hrms/project-timesheets  

```jsx
{
  "assignmentId": 1,
  "workDate": "2026-10-14",
  "regularHours": 8,
  "overtimeHours": 2,
  "activity": "Completed site installation work and material inspection."
}
```

→ Review project timesheet 

PERMISSION : hrms_project_timesheet:update

PUT  http://localhost:4500/api/hrms/project-timesheets/:timesheetId/review  

```jsx
{
  "status": "approved",   //'pending', 'approved', 'rejected'
  "remarks": "Work hours verified against the site attendance record."
}
```

Important workflow rules:

- Only `pending` timesheets can be reviewed.
- The submitter cannot review their own timesheet. Use another authenticated user.
- Approving a timesheet recalculates the project's labour cost.

→ LIST PROJECT TIMESHEETS

PERMISSION : hrms_project_timesheet:view

GET

http://localhost:4500/api/hrms/project-timesheets  

http://localhost:4500/api/hrms/project-timesheets?employeeId=1&projectId=1&status=pending&fromDate=2026-10-01&toDate=2026-10-31

## → HRMS Analytics

PERMISSION : hrms_analytics:view

GET

 http://localhost:4500/api/hrms/analytics

 http://localhost:4500/api/hrms/analytics?fromDate=2026-10-01&toDate=2026-10-31

### —> Complete Thunder Client Collection

```jsx
HRMS
│
├── 01 Employees
│   ├── GET Employees
│   ├── POST Create Employee
│   ├── GET Employee By ID
│   ├── PUT Update Employee
│   └── DELETE Employee
│
├── 02 Attendance
│   ├── GET Attendance
│   ├── POST Attendance
│   └── GET Attendance Alerts
│
├── 03 Leave
│   ├── GET Leave Requests
│   ├── POST Leave Request
│   ├── PUT Approve Leave
│   ├── GET Leave Balances
│   └── PUT Leave Balance
│
├── 04 Overtime
│   ├── GET Overtime
│   ├── POST Overtime
│   └── PUT Approve Overtime
│
├── 05 Payroll
│   ├── GET Deduction Rules
│   ├── POST Deduction Rule
│   ├── PUT Deduction Rule
│   ├── GET Payroll Runs
│   ├── POST Generate Payroll
│   ├── PUT Approve Payroll
│   └── GET Payslip
│
├── 06 Documents
│   ├── GET Employee Documents
│   ├── POST Employee Document
│   └── DELETE Document
│
├── 07 Onboarding
│   ├── GET Onboarding Tasks
│   ├── POST Onboarding Task
│   └── PUT Update Onboarding Task
│
├── 08 Rosters
│   ├── GET Rosters
│   └── POST Roster
│
└── 09 Reports
    └── GET HRMS Analytics
```

### —> testing sequence with actual IDs

```jsx
1. POST /employees
       ↓
   employee_id = 1
       ↓
2. POST /attendance
       ↓
3. POST /leave-balances/1
       ↓
4. POST /leave-requests
       ↓
   leave_id = 1
       ↓
5. PUT /leave-requests/1
   status = approved
       ↓
6. POST /overtime-requests
       ↓
   overtime_request_id = 1
       ↓
7. PUT /overtime-requests/1/review
   status = approved
       ↓
8. POST /deduction-rules
       ↓
   rule_id = 1
       ↓
9. POST /payroll
       ↓
   payroll_id = 1
       ↓
10. PUT /payroll/1/approve
       ↓
11. GET /payroll/1/payslips/1
       ↓
12. POST /employees/1/documents
       ↓
13. POST /onboarding-tasks
       ↓
   task_id = 1
       ↓
14. PUT /onboarding-tasks/1
       ↓
   completed
       ↓
15. POST /rosters
       ↓
16. GET /attendance/alerts
       ↓
17. GET /analytics
```

---

---

# FLOW OF THE SOFTWARE PROCESS

Setup forms → Customers/Items → Lead → Enquiry → Quotation → Sales order → Project (with its 8 sub-forms) → Requisition → PO → GRN → Stock → Site issue → Invoice → Credit/Debit note → Close project.

!image.png

!image.png

!image.png

```jsx
                    ┌───────────────┐
                    │ PLATFORM ADMIN│
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ CREATE COMPANY│
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ TENANT DB     │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ USER LOGIN    │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │ MASTER DATA   │
                    └───────┬───────┘
                            ↓
                  ┌────────────────────┐
                  │       CRM          │
                  └─────────┬──────────┘
                            ↓
                       ┌────────┐
                       │  LEAD  │
                       └───┬────┘
                           ↓
                     ┌───────────┐
                     │ CUSTOMER  │
                     └─────┬─────┘
                           ↓
                     ┌───────────┐
                     │ ENQUIRY   │
                     └─────┬─────┘
                           ↓
                    ┌─────────────┐
                    │  QUOTATION  │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ SALES ORDER │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │   PROJECT   │
                    └──────┬──────┘
                           │
           ┌───────────────┼────────────────┐
           ↓               ↓                ↓
       ┌────────┐     ┌──────────┐    ┌───────────┐
       │  BOQ   │     │ MANPOWER │    │ EQUIPMENT │
       └────────┘     └──────────┘    └───────────┘
           │               │                │
           └───────────────┼────────────────┘
                           ↓
                    ┌─────────────┐
                    │ PROCUREMENT │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ PURCHASE PO │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │     GRN     │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │  WAREHOUSE  │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │ SITE ISSUE  │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │SITE EXECUTION│
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │   PROFORMA  │
                    └──────┬──────┘
                           ↓
                  ┌──────────────────┐
                  │ DELIVERY CHALLAN │
                  └────────┬─────────┘
                           ↓
                    ┌─────────────┐
                    │ SALES INVOICE│
                    └──────┬──────┘
                           ↓
                  ┌──────────────────┐
                  │ PAYMENT / NOTES  │
                  │ CR / DR NOTE     │
                  └────────┬─────────┘
                           ↓
                    ┌─────────────┐
                    │   PROJECT   │
                    │  COMPLETED  │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │    CLOSED   │
                    └─────────────┘
```