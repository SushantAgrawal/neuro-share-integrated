export const allMessages = {
  'neuroRelated': 'neuro:related',
  'invokeAddRelapses': 'invoke:add:relapses',
  'invokeAddEdss': 'invoke:add:edss',
  'invokeAddWalk25Feet': 'invoke:add:walk25Feet',
  'toggleVirtualCaseload': 'toggle:virtual:caseload',
  'graphScaleUpdated': 'graph:scale:updated',
  'timelineScroll': 'timeline:scroll',
  'demographicEnableCheckBox': 'demographic:enable:check:box',
  'checkboxEnable': 'checkbox:enable',
  'showCustomError': 'show:custom:error',
  'showLogicalError': 'show:logical:error'
};

export const manyHttpMessages = {
  'httpGetInitialApiCall': 'http:get:initial:api:call',
};
export const allHttpMessages = {
  'httpGetWalk25Feet': 'http:get:walk25Feet',
  'httpPostWalk25Feet': 'http:post:walk25Feet',
  'httpPutWalk25Feet': 'http:put:walk25Feet',

  'httpGetEdss': 'http:get:edss',
  'httpPostEdss': 'http:post:edss',
  'httpPutEdss': 'http:put:edss',

  'httpGetRelapse': 'http:get:relapse',
  'httpPutRelapse': 'http:put:relapse',
  'httpPostRelapse': 'http:post:relapse',

  'httpGetDmt': 'http:get:dmt',
  'httpPostDmt': 'http:post:dmt',
  'httpPutDmt': 'http:put:dmt',

  'httpGetOtherMeds': 'http:get:otherMeds',
  'httpPostOtherMeds': 'http:post:otherMeds',
  'httpPutOtherMeds': 'http:put:otherMeds',

  'httpGetCdsUserData': 'http:get:cds:user:data',
  'httpPutCdsUserData': 'http:put:cds:user:data',
  'httpPostCdsUserData': 'http:post:cds:user:data',

  'httpGetAllQuestionnaire': 'http:get:all:questionnaire',
  'httpGetImaging': 'http:get:imaging',
  'httpGetLabs': 'http:get:labs',
  'httpGetVirtualCaseLoad': 'http:get:virtualCaseLoad',
  'httpGetWalk25FeetInfo': 'http:get:walk25Feet:info',
  'httpGetCdsInfo': 'http:get:cds:info',

  'httpGetMedications': 'http:get:medications',
  'httpGetEncounters': 'http:get:encounters',
  'httpGetProgressNote': 'http:get:progressNote'
};
export const urlMaps = window["gUrlMaps"];

export const cdsMap = {
  dmt: ['review_dmts'],
  otherMeds: ['review_other_meds'],
  vitaminD: ['review_vitamin_d'],
  referrals: ['review_symptoms_referrals'],
  edss: ['review_symptom_status'],
  walk25Feet: ['review_symptom_status'],
  imaging: ['review_mri_images'],
  symptoms: ['review_symptom_status'],
  labs: ['review_monitoring_labs'],
  vaccinations: ['review_vaccinations'],
  relapses: ['review_relapses']
};

export const medication = {
  dmt: {
    genericNames: [
      "MitoxantroneHCl",
      "Glatiramer Acetate",
      "Interferon Beta-1a",
      "Interferon Beta-1b",
      "Peginterferon Beta-1a",
      "Teriflunomide",
      "Alemtuzumab",
      "Natalizumab",
      "Dimethyl Fumarate",
      "Dalfampridine",
      "FingolimodHCl",
      "Rituximab IV Soln",
      "DaclizumabSoln",
      "Ocrelizumab"
    ]
  },
  vitaminD: {
    ids: [
      123943,
      130116,
      165257,
      86942,
      137499,
      158211,
      129927,
      157347,
      134362,
      117453,
      165255,
      136312,
      118181,
      117155,
      131102,
      127203,
      120020,
      65879,
      130017,
      62127,
      62081,
      61576,
      86945,
      23666,
      90551,
      157272,
      35197,
      130964,
      148413,
      41126,
      93253,
      152124,
      123003,
      131261,
      130016,
      116226,
      91720
    ]
  },
  otherMeds: {
    ids: [
      15987,
      40627,
      6545,
      28827,
      52604,
      32495,
      28826,
      6802,
      6538,
      31034,
      52603,
      32496,
      29292,
      48876,
      133042,
      51331,
      6801,
      133041,
      78895,
      25491,
      133043,
      24149,
      25490,
      157653,
      44951,
      13408,
      45558,
      44950,
      13410,
      157652,
      24148,
      13409,
      57985,
      85385,
      41276,
      57986,
      1130,
      54133,
      57988,
      1131,
      48967,
      57987,
      1127,
      36593,
      57991,
      1132,
      44062,
      57989,
      56142,
      44063,
      57984,
      56143,
      44897,
      54963,
      94748,
      48459,
      54962,
      54982,
      48968,
      54961,
      31022,
      31022,
      2388,
      27520,
      27520,
      2389,
      27521,
      27521,
      1644,
      30276,
      30276,
      64466,
      46461,
      46461,
      6507,
      30791,
      29319,
      6505,
      30792,
      29315,
      6506,
      14668,
      76987,
      69011,
      83093,
      16942,
      92951,
      49297,
      29948,
      26609,
      49298,
      2501,
      14184,
      53407,
      1130,
      36476,
      25473,
      1131,
      56873,
      26233,
      1127,
      56874,
      45862,
      1132,
      2388,
      40628,
      6544,
      2389,
      40626,
      64466,
      1644
    ],
    mappedCodes: ["G35"]
  }
};

export const GRAPH_SETTINGS = {
  panel: {
    offsetHeight: 640,
    offsetWidth: 710,
    marginTop: 5,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 25
  },
  medications: {
    positionTop: 520,
    containerHeight: 110,
    chartsWidth: 665,
    dmtColor: "#607D8B",
    dmtOverlapColor: "#303945",
    vitaminDColor: "#FBC02D",
    vitaminDOverlapColor: "#A07A1C",
    otherMedsColor: "#D8DFE2",
    otherMedsOverlapColor: "#898E90"

  },
  edss: {
    positionTop: 300,
    chartHeight: 200,
    maxValueY: 9,
    color: "#EA700D"
  },
  relapse: {
    positionTop: 260,
    chartHeight: 30,
    color: "#E53935"
  },
  imaging: {
    positionTop: 220,
    chartHeight: 30,
    color: "#BE90D4"
  },
  labs: {
    positionTop: 180,
    chartHeight: 30,
    color: "#00AAA5"
  },
  walk25Feet: {
    positionTop: 300,
    chartHeight: 200,
    maxValueY: 30,
    color: "#31859B"
  },
  symptoms: {
    positionTop: 260,
    chartHeight: 30,
    color: "#EA700D"
  }
}

export const errorMessages = {
  'U-006': { type: 'User Error', message: 'User tries to enter in invalid data type, range, or value (ex: date, age, etc.)' },
  'U-004': { type: 'User Error', message: 'Patient did not complete the questionnaire prior to the encounter' },
  'D-001': { type: 'Data Error', message: 'Unexpected data that cannot be plotted - Epic/EHR sometimes contains text values that read "No result" instead of a numeric value' },
  'D-002': { type: 'Data Error', message: 'Unexpected data that cannot be plotted - Source other than Epic sometimes contains text values that read "No result" instead of a numeric value' },
  'M-001': { type: 'Missing Data Notification', message: 'Patient did not complete that question of the questionnaire prior to the encounter and it is not required' },
  'M-002': { type: 'Missing Data Notification', message: 'Data from the access data source (ex: EPIC/EHR) are not available' },
}

export const applicationErrorMessages = {
  idNotMappedToUrl: 'Message id is not mapped to http url in config.ts file at application root.',
  httpGetUnknownError: 'Unknown error encountered while making http get request',
  logicalError: 'Error occured while processing {{component}} data',
}

export const edssScoreChart = [{ score: '0.0', title: 'Normal neurological exam.' }
  , { score: '1.0', title: 'No Disability, minimal signs in one FS.' }
  , { score: '1.5', title: 'No disability, minimal signs in more than one FS.' }
  , { score: '2.0', title: 'Minimal disability in one FS.' }
  , { score: '2.5', title: 'Mild disability in one FS or minimal disability in two FS.' }
  , { score: '3.0', title: 'Moderate disability in on FS, or mild disability in three or four FS. No impairment to walking.' }
  , { score: '3.5', title: 'Moderate disability in one FS and more than minimal disability in several others. No impairment to walking.' }
  , { score: '4.0', title: 'Significant disability but self-sufficient and up and about some 12 hours a day. Able to walk without aid or rest for 500m.' }
  , { score: '4.5', title: 'Significant disability but up and about much of the day, able to work a full day, may otherwise have some limitation of full activity or require minimal assistance. Able to walk without aid or rest for 300m.' }
  , { score: '5.0', title: 'Disability severe enough to impair full daily activities and ability to work a full day without special provisions. Able to walk without aid or ret for 200m.' }
  , { score: '5.5', title: 'Disability severe enough to preclude full daily activities. Able to walk without aid or rest for 100m.' }
  , { score: '6.0', title: 'Requires a walking aid, cane, crutch, etc – to walk about 100m with our without resting.' }
  , { score: '6.5', title: 'Requires two walking aids – pair of canes, crutches, etc – to walk about 20m without resting.' }
  , { score: '7.0', title: 'Unable to walk beyond approximately 5m even with aid. Essentially restricted to wheelchair, though wheels self in standard wheelchair and transfers alone. UP and about in wheelchair some 12 hours a day.' }
  , { score: '7.5', title: 'Unable to take more than a few steps. Restricted to wheelchair and may need aid in transferring. Can wheel self but cannot carry on in a standard wheelchair for a full day and may require a motorized wheelchair.' }
  , { score: '8.0', title: 'Essentially restricted to bed or chair or pushed in wheelchair. May be out of bed itself much of the day. Retains many self-care functions. Generally has effective use of arms.' }
  , { score: '8.5', title: 'Essentially restricted to bed most of the day. Has some effective use of arms retains some self-care functions.' }
  , { score: '9.0', title: 'Confined to bed. Can still communicate and eat.' }
  , { score: '9.5', title: 'Confined to bed and totally dependent. Unable to communicate effectively or eat/swallow.' }
  , { score: '10', title: 'Death due to MS.' }];

export const labsConfig = [
  {
    "Care Grouping": "Treatment",
    "Lab Name": "White Blood Cell, Count",
    "Abbreviation": "WBC",
    "Lab Component ID": "LABWBC",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "Hematocrit",
    "Abbreviation": "HCT",
    "Lab Component ID": "LABHCT",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "CBC with Automated Differential",
    "Abbreviation": "",
    "Lab Component ID": "LABCBCA",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "Platelet Count",
    "Abbreviation": "PLT",
    "Lab Component ID": "LABPLT",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "AST, Aspartate Aminotransferase",
    "Abbreviation": "AST",
    "Lab Component ID": "LABAST",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "ALT, Alanine Transminase",
    "Abbreviation": "ALT",
    "Lab Component ID": "LABALT",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "Liver Panel (Hepatic)",
    "Abbreviation": "",
    "Lab Component ID": "LABLIVR",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "Basic Metabolic Panel W GFF (Astra7)",
    "Abbreviation": "AST",
    "Lab Component ID": "LABBMPG",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "Thyroid Stimulating Hormone (TSH)",
    "Abbreviation": "TSH",
    "Lab Component ID": "LABTSH",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "JC Polyoma Virus DNA, PCR, Qual",
    "Abbreviation": "Ani JCV",
    "Lab Component ID": "LABRSJCV",
    "Comments": "Found in Epic \"Test",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "VZV (Varicella Zoster) Antibody IGG) - Titer",
    "Abbreviation": "VZV",
    "Lab Component ID": "LABVZVG2",
    "Comments": "Found in Epic \"Test",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "VZV (Varicella Zoster) Antibody IGM)- Titer",
    "Abbreviation": "VZV",
    "Lab Component ID": "LABVZVM",
    "Comments": "Found in Epic \"Test",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "VZV (Varicella Zoster) Antibody Panel, CSF - Titer",
    "Abbreviation": "VZV",
    "Lab Component ID": "",
    "Comments": "",
    "Specimen Type": "CSF (Spinal Fluid)"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "IGG Index, CSF",
    "Abbreviation": "IgG Index",
    "Lab Component ID": "LABRIGGC",
    "Comments": "",
    "Specimen Type": "CSF"
  },
  {
    "Care Grouping": "Treatment",
    "Lab Name": "TB Screen Quantiferon Gold",
    "Abbreviation": "QFT-G",
    "Lab Component ID": "LABTBSC",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "",
    "Lab Name": "",
    "Abbreviation": "",
    "Lab Component ID": "",
    "Comments": "",
    "Specimen Type": ""
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Lyme Antibody, Total W Reflex Western Blot",
    "Abbreviation": "LYME",
    "Lab Component ID": "LABRLYMES",
    "Comments": "",
    "Specimen Type": "blood / csf"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Lyme DNA, Whole Blood",
    "Abbreviation": "",
    "Lab Component ID": "LABRBBURB",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Oligoclonal Bands IGG (CSR & SERUM)",
    "Abbreviation": "OCB",
    "Lab Component ID": "LABROLIB",
    "Comments": "",
    "Specimen Type": "CSF / Blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Immunofixation, CSF",
    "Abbreviation": "",
    "Lab Component ID": "LABIMMUF",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "CSF"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Lupus 12 Panel",
    "Abbreviation": "",
    "Lab Component ID": "LABRLUPUP",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "ANA Screen w Reflex Autoimm Panel",
    "Abbreviation": "",
    "Lab Component ID": "LABANASP",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Sjogrens SSA Antibody - Titer",
    "Abbreviation": "",
    "Lab Component ID": "LABSSA2",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Sjogrens SSB Antibody - Titer",
    "Abbreviation": "",
    "Lab Component ID": "LABSSB2",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "ESR, Erythrocyte Sedimentation Rate",
    "Abbreviation": "ESR",
    "Lab Component ID": "LABESR",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Angiotensin Converting Enzyme (ACE)",
    "Abbreviation": "",
    "Lab Component ID": "LABRANGI",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Angiotensin Converting Enzyme (ACE), CSF",
    "Abbreviation": "",
    "Lab Component ID": "LABRACECF",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "CSF"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Rapid Plasma Regain",
    "Abbreviation": "RPR",
    "Lab Component ID": "LABRPR",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Electrophoresis Protein",
    "Abbreviation": "",
    "Lab Component ID": "LABSPE",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "C Reactive Protein, Inflammatory",
    "Abbreviation": "",
    "Lab Component ID": "LABCRPRTN",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Workup",
    "Lab Name": "Vitamin B12",
    "Abbreviation": "",
    "Lab Component ID": "LABB12",
    "Comments": "Added from Epic MS Smart Set",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "",
    "Lab Name": "",
    "Abbreviation": "",
    "Lab Component ID": "",
    "Comments": "",
    "Specimen Type": ""
  },
  {
    "Care Grouping": "MS Monitoring",
    "Lab Name": "Vitamin D (25 Hydroxy)",
    "Abbreviation": "",
    "Lab Component ID": "LABVITD",
    "Comments": "",
    "Specimen Type": "blood"
  },
  {
    "Care Grouping": "MS Monitoring",
    "Lab Name": "Urinalysis (Urine A)",
    "Abbreviation": "",
    "Lab Component ID": "",
    "Comments": "",
    "Specimen Type": "urine"
  },
  {
    "Care Grouping": "MS Monitoring",
    "Lab Name": "Urine Culture (UCX)",
    "Abbreviation": "",
    "Lab Component ID": "",
    "Comments": "",
    "Specimen Type": "urine"
  },
  {
    "Care Grouping": "MS Monitoring",
    "Lab Name": "LIPID PROFILE",
    "Abbreviation": "",
    "Lab Component ID": "LABLIPID",
    "Comments": "",
    "Specimen Type": "blood"
  }
];

export const imagingConfig = [
    {
      "proc_id": 358790,
      "proc_name": "HCHG MRI BRAIN FUNC TEST SELECT OR VISUAL STIM BY TECH",
      "proc_code": 30300138,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70554
    },
    {
      "proc_id": 362340,
      "proc_name": "HCHG MRI BRAIN FUNCTION BY MD/PSYCH BI",
      "proc_code": 30300142,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70555
    },
    {
      "proc_id": 362341,
      "proc_name": "HCHG MRI BRAIN FUNCTION BY MD/PSYCH LT",
      "proc_code": 30300143,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70555
    },
    {
      "proc_id": 362342,
      "proc_name": "HCHG MRI BRAIN FUNCTION BY MD/PSYCH RT",
      "proc_code": 30300144,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70555
    },
    {
      "proc_id": 358791,
      "proc_name": "HCHG MRI BRAIN TEST SELECT OR VISUAL STIM BY TECH BIL",
      "proc_code": 30300139,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70554
    },
    {
      "proc_id": 358792,
      "proc_name": "HCHG MRI BRAIN TEST SELECT OR VISUAL STIM BY TECH LT",
      "proc_code": 30300140,
      "RECORD_STATE_EAP_C": 4,
      "record_state": "Hidden",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70554
    },
    {
      "proc_id": 358793,
      "proc_name": "HCHG MRI BRAIN TEST SELECT OR VISUAL STIM BY TECH RT",
      "proc_code": 30300141,
      "RECORD_STATE_EAP_C": 4,
      "record_state": "Hidden",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70554
    },
    {
      "proc_id": 204999,
      "proc_name": "HCHG MRI BRAIN W STEM W AND WO CONTR",
      "proc_code": 30300014,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70553
    },
    {
      "proc_id": 204997,
      "proc_name": "HCHG MRI BRAIN W STEM W CONTR",
      "proc_code": 30300013,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70552
    },
    {
      "proc_id": 204995,
      "proc_name": "HCHG MRI BRAIN W STEM WO CONTR",
      "proc_code": 30300012,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70551
    },
    {
      "proc_id": 205025,
      "proc_name": "HCHG MRI SPINE CERV W AND WO CONTR",
      "proc_code": 30300027,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72156
    },
    {
      "proc_id": 205015,
      "proc_name": "HCHG MRI SPINE CERV W CONTR",
      "proc_code": 30300022,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72142
    },
    {
      "proc_id": 205013,
      "proc_name": "HCHG MRI SPINE CERV WO CONTR",
      "proc_code": 30300021,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72141
    },
    {
      "proc_id": 205029,
      "proc_name": "HCHG MRI SPINE LUMB W AND WO CONTR",
      "proc_code": 30300029,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72158
    },
    {
      "proc_id": 205023,
      "proc_name": "HCHG MRI SPINE LUMB W CONTR",
      "proc_code": 30300026,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72149
    },
    {
      "proc_id": 205021,
      "proc_name": "HCHG MRI SPINE LUMB WO CONTR",
      "proc_code": 30300025,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72148
    },
    {
      "proc_id": 205027,
      "proc_name": "HCHG MRI SPINE THOR W AND WO CONTR",
      "proc_code": 30300028,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72157
    },
    {
      "proc_id": 205019,
      "proc_name": "HCHG MRI SPINE THOR W CONTR",
      "proc_code": 30300024,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72147
    },
    {
      "proc_id": 205017,
      "proc_name": "HCHG MRI SPINE THOR WO CONTR",
      "proc_code": 30300023,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 72146
    },
    {
      "proc_id": 205127,
      "proc_name": "HCHG MRI VENOG BRAIN",
      "proc_code": 30300083,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 76498
    },
    {
      "proc_id": 92582,
      "proc_name": "HX BRAIN MRI W/O CONTR",
      "proc_code": "HX0051",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 23,
      "PROC_GROUP_NAME": "OTHER",
      "proc_type": "Charge",
      "CPT code": "HX0051"
    },
    {
      "proc_id": 333441,
      "proc_name": "MRI BRAIN",
      "proc_code": "RAD1285",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD1285"
    },
    {
      "proc_id": 65023535,
      "proc_name": "MRI BRAIN FUNCTIONAL W PHYSICIAN",
      "proc_code": "RAD1386",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD1386"
    },
    {
      "proc_id": 65023563,
      "proc_name": "MRI BRAIN FUNCTIONAL WO PHYSICIAN",
      "proc_code": "RAD1385",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD1385"
    },
    {
      "proc_id": 65002479,
      "proc_name": "MRI BRAIN LIMITED HYDRO PROTOCOL",
      "proc_code": "RAD1988",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD1988"
    },
    {
      "proc_id": 348550,
      "proc_name": "MRI BRAIN STROKE PROTOCOL",
      "proc_code": "M64170",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": "M64170"
    },
    {
      "proc_id": 86536,
      "proc_name": "MRI BRAIN W CONTRAST",
      "proc_code": "RAD0187",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0187"
    },
    {
      "proc_id": 65002671,
      "proc_name": "MRI BRAIN W PERFUSION",
      "proc_code": "RAD2324",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD2324"
    },
    {
      "proc_id": 86540,
      "proc_name": "MRI BRAIN WO CONTRAST",
      "proc_code": "RAD0189",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0189"
    },
    {
      "proc_id": 65002374,
      "proc_name": "MRI BRAIN WO MRV HEAD WO",
      "proc_code": "RAD1892",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD1892"
    },
    {
      "proc_id": 86538,
      "proc_name": "MRI BRAIN WWO CONTRAST",
      "proc_code": "RAD0188",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0188"
    },
    {
      "proc_id": 65002373,
      "proc_name": "MRI BRAIN WWO MRV BRAIN WWO",
      "proc_code": "RAD1891",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD1891"
    },
    {
      "proc_id": 86546,
      "proc_name": "MRI CERVICAL SPINE W CONTRAST",
      "proc_code": "RAD0192",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0192"
    },
    {
      "proc_id": 86548,
      "proc_name": "MRI CERVICAL SPINE WO CONTRAST",
      "proc_code": "RAD0193",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0193"
    },
    {
      "proc_id": 86514,
      "proc_name": "MRI CERVICAL SPINE WWO CONTRAST",
      "proc_code": "RAD0176",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0176"
    },
    {
      "proc_id": 358103,
      "proc_name": "MRI CERVICAL THORACIC LUMBAR SPINE W CONTRAST",
      "proc_code": "RAD1414",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD1414"
    },
    {
      "proc_id": 180959,
      "proc_name": "MRI CERVICAL THORACIC LUMBAR SPINE WO CONTRAST",
      "proc_code": "RAD0914",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0914"
    },
    {
      "proc_id": 180961,
      "proc_name": "MRI CERVICAL THORACIC LUMBAR SPINE WWO CONTRAST",
      "proc_code": "RAD0915",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0915"
    },
    {
      "proc_id": 180963,
      "proc_name": "MRI CERVICAL THORACIC SPINE WO CONTRAST",
      "proc_code": "RAD0917",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0917"
    },
    {
      "proc_id": 180965,
      "proc_name": "MRI CERVICAL THORACIC SPINE WWO CONTRAST",
      "proc_code": "RAD0918",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0918"
    },
    {
      "proc_id": 65002632,
      "proc_name": "MRI SPINE SURVEY THORACIC LUMBAR PELVIS WO CON",
      "proc_code": "RAD2285",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD2285"
    },
    {
      "proc_id": 181024,
      "proc_name": "MRI THORACIC LUMBAR SPINE WO CONTRAST",
      "proc_code": "RAD0919",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0919"
    },
    {
      "proc_id": 181026,
      "proc_name": "MRI THORACIC LUMBAR SPINE WWO CONTRAST",
      "proc_code": "RAD0920",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0920"
    },
    {
      "proc_id": 86592,
      "proc_name": "MRI THORACIC SPINE W CONTRAST",
      "proc_code": "RAD0215",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0215"
    },
    {
      "proc_id": 86594,
      "proc_name": "MRI THORACIC SPINE WO CONTRAST",
      "proc_code": "RAD0216",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0216"
    },
    {
      "proc_id": 86526,
      "proc_name": "MRI THORACIC SPINE WWO CONTRAST",
      "proc_code": "RAD0182",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD0182"
    },
    {
      "proc_id": 336855,
      "proc_name": "MRI TOTAL SPINE SCREENING",
      "proc_code": "RAD1309",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "N",
      "PROC_GROUP_ID": 14,
      "PROC_GROUP_NAME": "IMAGING",
      "proc_type": "Charge",
      "CPT code": "RAD1309"
    },
    {
      "proc_id": 132975,
      "proc_name": "PR CT/MRI BRAIN DONE GREATER 24HRS",
      "proc_code": "3112F",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": "PR3112F"
    },
    {
      "proc_id": 132973,
      "proc_name": "PR CT/MRI BRAIN DONE W/IN 24 HRS",
      "proc_code": "3111F",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": "PR3111F"
    },
    {
      "proc_id": 123570,
      "proc_name": "PR FMRI BRAIN BY PHYS/PSYCH",
      "proc_code": 70555,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70555
    },
    {
      "proc_id": 123568,
      "proc_name": "PR FMRI BRAIN BY TECH",
      "proc_code": 70554,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70554
    },
    {
      "proc_id": 110463,
      "proc_name": "PR MRI BRAIN W & W/O CONTRAST",
      "proc_code": 70553,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70553
    },
    {
      "proc_id": 334729,
      "proc_name": "PR MRI BRAIN W/CONTRAST PROF COMP BO",
      "proc_code": "SPC1460",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70552
    },
    {
      "proc_id": 123574,
      "proc_name": "PR MRI BRAIN W/DYE",
      "proc_code": 70558,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70558
    },
    {
      "proc_id": 123566,
      "proc_name": "PR MRI BRAIN W/DYE",
      "proc_code": 70552,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70552
    },
    {
      "proc_id": 123576,
      "proc_name": "PR MRI BRAIN W/O & W/DYE",
      "proc_code": 70559,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70559
    },
    {
      "proc_id": 110461,
      "proc_name": "PR MRI BRAIN W/O CONTRAST",
      "proc_code": 70551,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70551
    },
    {
      "proc_id": 334727,
      "proc_name": "PR MRI BRAIN W/O CONTRAST PROF COMP BO",
      "proc_code": "SPC1459",
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70551
    },
    {
      "proc_id": 123572,
      "proc_name": "PR MRI BRAIN W/O DYE",
      "proc_code": 70557,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 70557
    },
    {
      "proc_id": 378713,
      "proc_name": "PR REV MRT - MRI - BRAIN (INCLUDING BRAINSTEM)",
      "proc_code": 611,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 611
    },
    {
      "proc_id": 378715,
      "proc_name": "PR REV MRT - MRI - SPINAL CORD (INCLUDING SPINE)",
      "proc_code": 612,
      "RECORD_STATE_EAP_C": "NULL",
      "record_state": "NULL",
      "IS_ACTIVE_YN": "Y",
      "PROC_GROUP_ID": "NULL",
      "PROC_GROUP_NAME": "NULL",
      "proc_type": "Charge",
      "CPT code": 612
    }
];
