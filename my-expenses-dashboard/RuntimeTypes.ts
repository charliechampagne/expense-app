// ---------------- Type Definitions which can be imported from ./RuntimeTypes -------------------------
export interface TableRegistrations extends BaseTableRegistrations {
    "contact": contact,
    "cp_expenseheader": cp_expenseheader,
    "cp_expenseline": cp_expenseline,
    "systemuser": systemuser,
}
export interface EnumRegistrations extends BaseEnumRegistrations {
    "contact-accountrolecode": contact_accountrolecode,
    "contact-address1_addresstypecode": contact_address1_addresstypecode,
    "contact-address1_freighttermscode": contact_address1_freighttermscode,
    "contact-address1_shippingmethodcode": contact_address1_shippingmethodcode,
    "contact-address2_addresstypecode": contact_address2_addresstypecode,
    "contact-address2_freighttermscode": contact_address2_freighttermscode,
    "contact-address2_shippingmethodcode": contact_address2_shippingmethodcode,
    "contact-address3_addresstypecode": contact_address3_addresstypecode,
    "contact-address3_freighttermscode": contact_address3_freighttermscode,
    "contact-address3_shippingmethodcode": contact_address3_shippingmethodcode,
    "contact-adx_confirmremovepassword": contact_adx_confirmremovepassword,
    "contact-adx_identity_emailaddress1confirmed": contact_adx_identity_emailaddress1confirmed,
    "contact-adx_identity_locallogindisabled": contact_adx_identity_locallogindisabled,
    "contact-adx_identity_lockoutenabled": contact_adx_identity_lockoutenabled,
    "contact-adx_identity_logonenabled": contact_adx_identity_logonenabled,
    "contact-adx_identity_mobilephoneconfirmed": contact_adx_identity_mobilephoneconfirmed,
    "contact-adx_identity_twofactorenabled": contact_adx_identity_twofactorenabled,
    "contact-adx_profilealert": contact_adx_profilealert,
    "contact-adx_profileisanonymous": contact_adx_profileisanonymous,
    "contact-creditonhold": contact_creditonhold,
    "contact-customersizecode": contact_customersizecode,
    "contact-customertypecode": contact_customertypecode,
    "contact-donotbulkemail": contact_donotbulkemail,
    "contact-donotbulkpostalmail": contact_donotbulkpostalmail,
    "contact-donotemail": contact_donotemail,
    "contact-donotfax": contact_donotfax,
    "contact-donotphone": contact_donotphone,
    "contact-donotpostalmail": contact_donotpostalmail,
    "contact-donotsendmm": contact_donotsendmm,
    "contact-educationcode": contact_educationcode,
    "contact-familystatuscode": contact_familystatuscode,
    "contact-followemail": contact_followemail,
    "contact-gendercode": contact_gendercode,
    "contact-haschildrencode": contact_haschildrencode,
    "contact-isautocreate": contact_isautocreate,
    "contact-isbackofficecustomer": contact_isbackofficecustomer,
    "contact-isprivate": contact_isprivate,
    "contact-leadsourcecode": contact_leadsourcecode,
    "contact-marketingonly": contact_marketingonly,
    "contact-merged": contact_merged,
    "contact-msdyn_decisioninfluencetag": contact_msdyn_decisioninfluencetag,
    "contact-msdyn_disablewebtracking": contact_msdyn_disablewebtracking,
    "contact-msdyn_gdproptout": contact_msdyn_gdproptout,
    "contact-msdyn_isassistantinorgchart": contact_msdyn_isassistantinorgchart,
    "contact-msdyn_isminor": contact_msdyn_isminor,
    "contact-msdyn_isminorwithparentalconsent": contact_msdyn_isminorwithparentalconsent,
    "contact-msdyn_orgchangestatus": contact_msdyn_orgchangestatus,
    "contact-mspp_userpreferredlcid": contact_mspp_userpreferredlcid,
    "contact-participatesinworkflow": contact_participatesinworkflow,
    "contact-paymenttermscode": contact_paymenttermscode,
    "contact-preferredappointmentdaycode": contact_preferredappointmentdaycode,
    "contact-preferredappointmenttimecode": contact_preferredappointmenttimecode,
    "contact-preferredcontactmethodcode": contact_preferredcontactmethodcode,
    "contact-shippingmethodcode": contact_shippingmethodcode,
    "contact-statecode": contact_statecode,
    "contact-statuscode": contact_statuscode,
    "contact-territorycode": contact_territorycode,
    "cp_expenseheader-statecode": cp_expenseheader_statecode,
    "cp_expenseheader-statuscode": cp_expenseheader_statuscode,
    "cp_expenseline-statecode": cp_expenseline_statecode,
    "cp_expenseline-statuscode": cp_expenseline_statuscode,
    "systemuser-accessmode": systemuser_accessmode,
    "systemuser-address1_addresstypecode": systemuser_address1_addresstypecode,
    "systemuser-address1_shippingmethodcode": systemuser_address1_shippingmethodcode,
    "systemuser-address2_addresstypecode": systemuser_address2_addresstypecode,
    "systemuser-address2_shippingmethodcode": systemuser_address2_shippingmethodcode,
    "systemuser-azurestate": systemuser_azurestate,
    "systemuser-caltype": systemuser_caltype,
    "systemuser-defaultfilterspopulated": systemuser_defaultfilterspopulated,
    "systemuser-deletedstate": systemuser_deletedstate,
    "systemuser-displayinserviceviews": systemuser_displayinserviceviews,
    "systemuser-emailrouteraccessapproval": systemuser_emailrouteraccessapproval,
    "systemuser-incomingemaildeliverymethod": systemuser_incomingemaildeliverymethod,
    "systemuser-invitestatuscode": systemuser_invitestatuscode,
    "systemuser-isactivedirectoryuser": systemuser_isactivedirectoryuser,
    "systemuser-isallowedbyipfirewall": systemuser_isallowedbyipfirewall,
    "systemuser-isdisabled": systemuser_isdisabled,
    "systemuser-isemailaddressapprovedbyo365admin": systemuser_isemailaddressapprovedbyo365admin,
    "systemuser-isintegrationuser": systemuser_isintegrationuser,
    "systemuser-islicensed": systemuser_islicensed,
    "systemuser-issyncwithdirectory": systemuser_issyncwithdirectory,
    "systemuser-msdyn_agentType": systemuser_msdyn_agentType,
    "systemuser-msdyn_botprovider": systemuser_msdyn_botprovider,
    "systemuser-msdyn_bottype": systemuser_msdyn_bottype,
    "systemuser-msdyn_gdproptout": systemuser_msdyn_gdproptout,
    "systemuser-msdyn_ischatintentenabled": systemuser_msdyn_ischatintentenabled,
    "systemuser-msdyn_isexpertenabledforswarm": systemuser_msdyn_isexpertenabledforswarm,
    "systemuser-msdyn_ismultichannelintentenabled": systemuser_msdyn_ismultichannelintentenabled,
    "systemuser-msdyn_isvoiceintentenabled": systemuser_msdyn_isvoiceintentenabled,
    "systemuser-msdyn_usertype": systemuser_msdyn_usertype,
    "systemuser-outgoingemaildeliverymethod": systemuser_outgoingemaildeliverymethod,
    "systemuser-preferredaddresscode": systemuser_preferredaddresscode,
    "systemuser-preferredemailcode": systemuser_preferredemailcode,
    "systemuser-preferredphonecode": systemuser_preferredphonecode,
    "systemuser-setupuser": systemuser_setupuser,
    "systemuser-systemmanagedusertype": systemuser_systemmanagedusertype,
}
export type contact = TableRow<{
    // Primary Key Column
    readonly contactid: string,
    // Foreign Key Column
    readonly _accountid_value: `/account(${string})`,
    readonly accountidname: string,
    readonly accountidyominame: string,
    accountrolecode: contact_accountrolecode,
    address1_addressid: string,
    address1_addresstypecode: contact_address1_addresstypecode,
    address1_city: string,
    readonly address1_composite: string,
    address1_country: string,
    address1_county: string,
    address1_fax: string,
    address1_freighttermscode: contact_address1_freighttermscode,
    address1_latitude: number,
    address1_line1: string,
    address1_line2: string,
    address1_line3: string,
    address1_longitude: number,
    address1_name: string,
    address1_postalcode: string,
    address1_postofficebox: string,
    address1_primarycontactname: string,
    address1_shippingmethodcode: contact_address1_shippingmethodcode,
    address1_stateorprovince: string,
    address1_telephone1: string,
    address1_telephone2: string,
    address1_telephone3: string,
    address1_upszone: string,
    address1_utcoffset: number,
    address2_addressid: string,
    address2_addresstypecode: contact_address2_addresstypecode,
    address2_city: string,
    readonly address2_composite: string,
    address2_country: string,
    address2_county: string,
    address2_fax: string,
    address2_freighttermscode: contact_address2_freighttermscode,
    address2_latitude: number,
    address2_line1: string,
    address2_line2: string,
    address2_line3: string,
    address2_longitude: number,
    address2_name: string,
    address2_postalcode: string,
    address2_postofficebox: string,
    address2_primarycontactname: string,
    address2_shippingmethodcode: contact_address2_shippingmethodcode,
    address2_stateorprovince: string,
    address2_telephone1: string,
    address2_telephone2: string,
    address2_telephone3: string,
    address2_upszone: string,
    address2_utcoffset: number,
    address3_addressid: string,
    address3_addresstypecode: contact_address3_addresstypecode,
    address3_city: string,
    readonly address3_composite: string,
    address3_country: string,
    address3_county: string,
    address3_fax: string,
    address3_freighttermscode: contact_address3_freighttermscode,
    address3_latitude: number,
    address3_line1: string,
    address3_line2: string,
    address3_line3: string,
    address3_longitude: number,
    address3_name: string,
    address3_postalcode: string,
    address3_postofficebox: string,
    address3_primarycontactname: string,
    address3_shippingmethodcode: contact_address3_shippingmethodcode,
    address3_stateorprovince: string,
    address3_telephone1: string,
    address3_telephone2: string,
    address3_telephone3: string,
    address3_upszone: string,
    address3_utcoffset: number,
    adx_confirmremovepassword: contact_adx_confirmremovepassword,
    adx_createdbyipaddress: string,
    adx_createdbyusername: string,
    adx_identity_accessfailedcount: number,
    adx_identity_emailaddress1confirmed: contact_adx_identity_emailaddress1confirmed,
    adx_identity_lastsuccessfullogin: Date,
    adx_identity_locallogindisabled: contact_adx_identity_locallogindisabled,
    adx_identity_lockoutenabled: contact_adx_identity_lockoutenabled,
    adx_identity_lockoutenddate: Date,
    adx_identity_logonenabled: contact_adx_identity_logonenabled,
    adx_identity_mobilephoneconfirmed: contact_adx_identity_mobilephoneconfirmed,
    adx_identity_newpassword: string,
    adx_identity_passwordhash: string,
    adx_identity_securitystamp: string,
    adx_identity_twofactorenabled: contact_adx_identity_twofactorenabled,
    adx_identity_username: string,
    adx_modifiedbyipaddress: string,
    adx_modifiedbyusername: string,
    adx_organizationname: string,
    adx_preferredlcid: number,
    adx_profilealert: contact_adx_profilealert,
    adx_profilealertdate: Date,
    adx_profilealertinstructions: string,
    adx_profileisanonymous: contact_adx_profileisanonymous,
    adx_profilelastactivity: Date,
    adx_profilemodifiedon: Date,
    adx_publicprofilecopy: string,
    adx_timezone: number,
    readonly aging30: number,
    readonly aging30_base: number,
    readonly aging60: number,
    readonly aging60_base: number,
    readonly aging90: number,
    readonly aging90_base: number,
    anniversary: Date,
    annualincome: number,
    readonly annualincome_base: number,
    assistantname: string,
    assistantphone: string,
    birthdate: Date,
    business2: string,
    businesscard: string,
    businesscardattributes: string,
    callback: string,
    childrensnames: string,
    company: string,
    // Foreign Key Column
    readonly _createdbyexternalparty_value: `/externalparty(${string})`,
    readonly createdbyexternalpartyname: string,
    readonly createdbyexternalpartyyominame: string,
    readonly createdbyname: string,
    readonly createdbyyominame: string,
    readonly createdonbehalfbyname: string,
    readonly createdonbehalfbyyominame: string,
    creditlimit: number,
    readonly creditlimit_base: number,
    creditonhold: contact_creditonhold,
    customersizecode: contact_customersizecode,
    customertypecode: contact_customertypecode,
    // Foreign Key Column
    readonly _defaultpricelevelid_value: `/pricelevel(${string})`,
    readonly defaultpricelevelidname: string,
    department: string,
    description: string,
    donotbulkemail: contact_donotbulkemail,
    donotbulkpostalmail: contact_donotbulkpostalmail,
    donotemail: contact_donotemail,
    donotfax: contact_donotfax,
    donotphone: contact_donotphone,
    donotpostalmail: contact_donotpostalmail,
    donotsendmm: contact_donotsendmm,
    educationcode: contact_educationcode,
    emailaddress1: string,
    emailaddress2: string,
    emailaddress3: string,
    employeeid: string,
    // This is an image encoded as a base64 string
    entityimage: string,
    readonly entityimage_timestamp: number,
    readonly entityimage_url: string,
    readonly entityimageid: string,
    readonly exchangerate: number,
    externaluseridentifier: string,
    familystatuscode: contact_familystatuscode,
    fax: string,
    firstname: string,
    followemail: contact_followemail,
    ftpsiteurl: string,
    readonly fullname: string,
    gendercode: contact_gendercode,
    governmentid: string,
    haschildrencode: contact_haschildrencode,
    home2: string,
    readonly isautocreate: contact_isautocreate,
    isbackofficecustomer: contact_isbackofficecustomer,
    readonly isprivate: contact_isprivate,
    jobtitle: string,
    lastname: string,
    lastonholdtime: Date,
    lastusedincampaign: Date,
    leadsourcecode: contact_leadsourcecode,
    managername: string,
    managerphone: string,
    marketingonly: contact_marketingonly,
    readonly mastercontactidname: string,
    readonly mastercontactidyominame: string,
    // Foreign Key Column
    readonly _masterid_value: `/contact(${string})`,
    readonly merged: contact_merged,
    middlename: string,
    mobilephone: string,
    // Foreign Key Column
    readonly _modifiedbyexternalparty_value: `/externalparty(${string})`,
    readonly modifiedbyexternalpartyname: string,
    readonly modifiedbyexternalpartyyominame: string,
    readonly modifiedbyname: string,
    readonly modifiedbyyominame: string,
    readonly modifiedonbehalfbyname: string,
    readonly modifiedonbehalfbyyominame: string,
    // Foreign Key Column
    readonly _msa_managingpartnerid_value: `/account(${string})`,
    readonly msa_managingpartneridname: string,
    readonly msa_managingpartneridyominame: string,
    // Foreign Key Column
    readonly _msdyn_contactkpiid_value: `/msdyn_contactkpiitem(${string})`,
    readonly msdyn_contactkpiidname: string,
    msdyn_decisioninfluencetag: contact_msdyn_decisioninfluencetag,
    msdyn_disablewebtracking: contact_msdyn_disablewebtracking,
    msdyn_gdproptout: contact_msdyn_gdproptout,
    msdyn_isassistantinorgchart: contact_msdyn_isassistantinorgchart,
    msdyn_isminor: contact_msdyn_isminor,
    msdyn_isminorwithparentalconsent: contact_msdyn_isminorwithparentalconsent,
    msdyn_orgchangestatus: contact_msdyn_orgchangestatus,
    msdyn_portaltermsagreementdate: Date,
    msdyn_primarytimezone: number,
    // Foreign Key Column
    readonly _msdyn_segmentid_value: `/msdyn_segment(${string})`,
    readonly msdyn_segmentidname: string,
    mspp_userpreferredlcid: contact_mspp_userpreferredlcid,
    nickname: string,
    numberofchildren: number,
    readonly onholdtime: number,
    // Foreign Key Column
    readonly _originatingleadid_value: `/lead(${string})`,
    readonly originatingleadidname: string,
    readonly originatingleadidyominame: string,
    readonly owningbusinessunitname: string,
    pager: string,
    // Foreign Key Column
    _parent_contactid_value: `/contact(${string})`,
    readonly parent_contactidname: string,
    readonly parent_contactidyominame: string,
    // Foreign Key Column
    readonly _parentcontactid_value: `/contact(${string})`,
    readonly parentcontactidname: string,
    readonly parentcontactidyominame: string,
    // Foreign Key Column
    _parentcustomerid_value: `/account(${string})` | `/contact(${string})`,
    readonly parentcustomeridname: string,
    parentcustomeridtype: string,
    readonly parentcustomeridyominame: string,
    participatesinworkflow: contact_participatesinworkflow,
    paymenttermscode: contact_paymenttermscode,
    preferredappointmentdaycode: contact_preferredappointmentdaycode,
    preferredappointmenttimecode: contact_preferredappointmenttimecode,
    preferredcontactmethodcode: contact_preferredcontactmethodcode,
    // Foreign Key Column
    readonly _preferredequipmentid_value: `/equipment(${string})`,
    readonly preferredequipmentidname: string,
    // Foreign Key Column
    readonly _preferredserviceid_value: `/service(${string})`,
    readonly preferredserviceidname: string,
    // Foreign Key Column
    _preferredsystemuserid_value: `/systemuser(${string})`,
    readonly preferredsystemuseridname: string,
    readonly preferredsystemuseridyominame: string,
    processid: string,
    salutation: string,
    shippingmethodcode: contact_shippingmethodcode,
    // Foreign Key Column
    readonly _slaid_value: `/sla(${string})`,
    // Foreign Key Column
    readonly _slainvokedid_value: `/sla(${string})`,
    readonly slainvokedidname: string,
    readonly slaname: string,
    spousesname: string,
    stageid: string,
    statecode: contact_statecode,
    statuscode: contact_statuscode,
    readonly subscriptionid: string,
    suffix: string,
    teamsfollowed: number,
    telephone1: string,
    telephone2: string,
    telephone3: string,
    territorycode: contact_territorycode,
    readonly timespentbymeonemailandmeetings: string,
    // Foreign Key Column
    readonly _transactioncurrencyid_value: `/transactioncurrency(${string})`,
    readonly transactioncurrencyidname: string,
    traversedpath: string,
    websiteurl: string,
    yomifirstname: string,
    readonly yomifullname: string,
    yomilastname: string,
    yomimiddlename: string,
}>

export type cp_expenseheader = TableRow<{
    // Primary Key Column
    readonly cp_expenseheaderid: string,
    // Foreign Key Column
    _cp_contactid_value: `/contact(${string})`,
    readonly cp_contactidname: string,
    readonly cp_contactidyominame: string,
    cp_date: Date,
    cp_description: string,
    cp_name: string,
    cp_totalamount: number,
    readonly cp_totalamount_base: number,
    readonly createdbyname: string,
    readonly createdbyyominame: string,
    readonly createdonbehalfbyname: string,
    readonly createdonbehalfbyyominame: string,
    readonly exchangerate: number,
    readonly modifiedbyname: string,
    readonly modifiedbyyominame: string,
    readonly modifiedonbehalfbyname: string,
    readonly modifiedonbehalfbyyominame: string,
    readonly owningbusinessunitname: string,
    statecode: cp_expenseheader_statecode,
    statuscode: cp_expenseheader_statuscode,
    // Foreign Key Column
    readonly _transactioncurrencyid_value: `/transactioncurrency(${string})`,
    readonly transactioncurrencyidname: string,
}>

export type cp_expenseline = TableRow<{
    // Primary Key Column
    readonly cp_expenselineid: string,
    cp_amount: number,
    readonly cp_amount_base: number,
    cp_date: Date,
    cp_description: string,
    // Foreign Key Column
    _cp_expenseheaderid_value: `/cp_expenseheader(${string})`,
    readonly cp_expenseheaderidname: string,
    cp_name: string,
    readonly cp_receipt_name: string,
    readonly createdbyname: string,
    readonly createdbyyominame: string,
    readonly createdonbehalfbyname: string,
    readonly createdonbehalfbyyominame: string,
    readonly exchangerate: number,
    readonly modifiedbyname: string,
    readonly modifiedbyyominame: string,
    readonly modifiedonbehalfbyname: string,
    readonly modifiedonbehalfbyyominame: string,
    readonly owningbusinessunitname: string,
    statecode: cp_expenseline_statecode,
    statuscode: cp_expenseline_statuscode,
    // Foreign Key Column
    readonly _transactioncurrencyid_value: `/transactioncurrency(${string})`,
    readonly transactioncurrencyidname: string,
}>

export type systemuser = TableRow<{
    // Primary Key Column
    readonly systemuserid: string,
    accessmode: systemuser_accessmode,
    readonly activedirectoryguid: string,
    address1_addressid: string,
    address1_addresstypecode: systemuser_address1_addresstypecode,
    address1_city: string,
    readonly address1_composite: string,
    address1_country: string,
    address1_county: string,
    address1_fax: string,
    address1_latitude: number,
    address1_line1: string,
    address1_line2: string,
    address1_line3: string,
    address1_longitude: number,
    address1_name: string,
    address1_postalcode: string,
    address1_postofficebox: string,
    address1_shippingmethodcode: systemuser_address1_shippingmethodcode,
    address1_stateorprovince: string,
    address1_telephone1: string,
    address1_telephone2: string,
    address1_telephone3: string,
    address1_upszone: string,
    address1_utcoffset: number,
    address2_addressid: string,
    address2_addresstypecode: systemuser_address2_addresstypecode,
    address2_city: string,
    readonly address2_composite: string,
    address2_country: string,
    address2_county: string,
    address2_fax: string,
    address2_latitude: number,
    address2_line1: string,
    address2_line2: string,
    address2_line3: string,
    address2_longitude: number,
    address2_name: string,
    address2_postalcode: string,
    address2_postofficebox: string,
    address2_shippingmethodcode: systemuser_address2_shippingmethodcode,
    address2_stateorprovince: string,
    address2_telephone1: string,
    address2_telephone2: string,
    address2_telephone3: string,
    address2_upszone: string,
    address2_utcoffset: number,
    applicationid: string,
    readonly applicationiduri: string,
    readonly azureactivedirectoryobjectid: string,
    readonly azuredeletedon: Date,
    azurestate: systemuser_azurestate,
    // Foreign Key Column
    readonly _businessunitid_value: `/businessunit(${string})`,
    readonly businessunitidname: string,
    // Foreign Key Column
    readonly _calendarid_value: `/calendar(${string})`,
    caltype: systemuser_caltype,
    readonly createdbyname: string,
    readonly createdbyyominame: string,
    readonly createdonbehalfbyname: string,
    readonly createdonbehalfbyyominame: string,
    readonly defaultfilterspopulated: systemuser_defaultfilterspopulated,
    // Foreign Key Column
    readonly _defaultmailbox_value: `/mailbox(${string})`,
    readonly defaultmailboxname: string,
    readonly defaultodbfoldername: string,
    readonly deletedstate: systemuser_deletedstate,
    readonly disabledreason: string,
    displayinserviceviews: systemuser_displayinserviceviews,
    domainname: string,
    emailrouteraccessapproval: systemuser_emailrouteraccessapproval,
    employeeid: string,
    // This is an image encoded as a base64 string
    entityimage: string,
    readonly entityimage_timestamp: number,
    readonly entityimage_url: string,
    readonly entityimageid: string,
    readonly exchangerate: number,
    firstname: string,
    readonly fullname: string,
    governmentid: string,
    homephone: string,
    readonly identityid: number,
    incomingemaildeliverymethod: systemuser_incomingemaildeliverymethod,
    internalemailaddress: string,
    invitestatuscode: systemuser_invitestatuscode,
    readonly isactivedirectoryuser: systemuser_isactivedirectoryuser,
    isallowedbyipfirewall: systemuser_isallowedbyipfirewall,
    isdisabled: systemuser_isdisabled,
    readonly isemailaddressapprovedbyo365admin: systemuser_isemailaddressapprovedbyo365admin,
    isintegrationuser: systemuser_isintegrationuser,
    islicensed: systemuser_islicensed,
    issyncwithdirectory: systemuser_issyncwithdirectory,
    jobtitle: string,
    lastname: string,
    readonly latestupdatetime: Date,
    middlename: string,
    mobilealertemail: string,
    // Foreign Key Column
    readonly _mobileofflineprofileid_value: `/mobileofflineprofile(${string})`,
    mobileofflineprofileidname: string,
    mobilephone: string,
    readonly modifiedbyname: string,
    readonly modifiedbyyominame: string,
    readonly modifiedonbehalfbyname: string,
    readonly modifiedonbehalfbyyominame: string,
    msdyn_activeconversationlimit: number,
    msdyn_agentType: systemuser_msdyn_agentType,
    msdyn_botapplicationid: string,
    msdyn_botdescription: string,
    msdyn_botendpoint: string,
    msdyn_bothandle: string,
    msdyn_botprovider: systemuser_msdyn_botprovider,
    msdyn_botsecretkeys: string,
    msdyn_bottype: systemuser_msdyn_bottype,
    msdyn_callforwardingnumber: string,
    msdyn_capacity: number,
    msdyn_cognitiveservicesregion: string,
    msdyn_cognitiveservicessubscriptionkey: string,
    // Foreign Key Column
    readonly _msdyn_defaultpresenceiduser_value: `/msdyn_presence(${string})`,
    readonly msdyn_defaultpresenceidusername: string,
    msdyn_emergencyemailrecipients: string,
    msdyn_gdproptout: systemuser_msdyn_gdproptout,
    msdyn_gridwrappercontrolfield: string,
    msdyn_ischatintentenabled: systemuser_msdyn_ischatintentenabled,
    msdyn_isexpertenabledforswarm: systemuser_msdyn_isexpertenabledforswarm,
    msdyn_ismultichannelintentenabled: systemuser_msdyn_ismultichannelintentenabled,
    msdyn_isvoiceintentenabled: systemuser_msdyn_isvoiceintentenabled,
    msdyn_owningenvironmentid: string,
    // Foreign Key Column
    readonly _msdyn_phonenumberid_value: `/msdyn_ocphonenumber(${string})`,
    readonly msdyn_phonenumberidname: string,
    msdyn_usertype: systemuser_msdyn_usertype,
    nickname: string,
    readonly organizationid: string,
    readonly organizationidname: string,
    outgoingemaildeliverymethod: systemuser_outgoingemaildeliverymethod,
    // Foreign Key Column
    _parentsystemuserid_value: `/systemuser(${string})`,
    readonly parentsystemuseridname: string,
    readonly parentsystemuseridyominame: string,
    passporthi: number,
    passportlo: number,
    personalemailaddress: string,
    photourl: string,
    // Foreign Key Column
    readonly _positionid_value: `/position(${string})`,
    readonly positionidname: string,
    preferredaddresscode: systemuser_preferredaddresscode,
    preferredemailcode: systemuser_preferredemailcode,
    preferredphonecode: systemuser_preferredphonecode,
    processid: string,
    // Foreign Key Column
    readonly _queueid_value: `/queue(${string})`,
    readonly queueidname: string,
    salutation: string,
    setupuser: systemuser_setupuser,
    sharepointemailaddress: string,
    // Foreign Key Column
    readonly _siteid_value: `/site(${string})`,
    readonly siteidname: string,
    skills: string,
    stageid: string,
    systemmanagedusertype: systemuser_systemmanagedusertype,
    // Foreign Key Column
    readonly _territoryid_value: `/territory(${string})`,
    readonly territoryidname: string,
    title: string,
    // Foreign Key Column
    readonly _transactioncurrencyid_value: `/transactioncurrency(${string})`,
    readonly transactioncurrencyidname: string,
    traversedpath: string,
    userlicensetype: number,
    readonly userpuid: string,
    windowsliveid: string,
    yammeremailaddress: string,
    yammeruserid: string,
    yomifirstname: string,
    readonly yomifullname: string,
    yomilastname: string,
    yomimiddlename: string,
}>

const enum contact_accountrolecode {
"Decision Maker" = 1,
"Employee" = 2,
"Influencer" = 3,
}
const enum contact_address1_addresstypecode {
"Bill To" = 1,
"Ship To" = 2,
"Primary" = 3,
"Other" = 4,
}
const enum contact_address1_freighttermscode {
"FOB" = 1,
"No Charge" = 2,
}
const enum contact_address1_shippingmethodcode {
"Airborne" = 1,
"DHL" = 2,
"FedEx" = 3,
"UPS" = 4,
"Postal Mail" = 5,
"Full Load" = 6,
"Will Call" = 7,
}
const enum contact_address2_addresstypecode {
"Default Value" = 1,
}
const enum contact_address2_freighttermscode {
"Default Value" = 1,
}
const enum contact_address2_shippingmethodcode {
"Default Value" = 1,
}
const enum contact_address3_addresstypecode {
"Default Value" = 1,
}
const enum contact_address3_freighttermscode {
"Default Value" = 1,
}
const enum contact_address3_shippingmethodcode {
"Default Value" = 1,
}
const enum contact_adx_confirmremovepassword {
"No" = 0,
"Yes" = 1,
}
const enum contact_adx_identity_emailaddress1confirmed {
"No" = 0,
"Yes" = 1,
}
const enum contact_adx_identity_locallogindisabled {
"No" = 0,
"Yes" = 1,
}
const enum contact_adx_identity_lockoutenabled {
"No" = 0,
"Yes" = 1,
}
const enum contact_adx_identity_logonenabled {
"No" = 0,
"Yes" = 1,
}
const enum contact_adx_identity_mobilephoneconfirmed {
"No" = 0,
"Yes" = 1,
}
const enum contact_adx_identity_twofactorenabled {
"No" = 0,
"Yes" = 1,
}
const enum contact_adx_profilealert {
"No" = 0,
"Yes" = 1,
}
const enum contact_adx_profileisanonymous {
"No" = 0,
"Yes" = 1,
}
const enum contact_creditonhold {
"No" = 0,
"Yes" = 1,
}
const enum contact_customersizecode {
"Default Value" = 1,
}
const enum contact_customertypecode {
"Default Value" = 1,
}
const enum contact_donotbulkemail {
"Allow" = 0,
"Do Not Allow" = 1,
}
const enum contact_donotbulkpostalmail {
"No" = 0,
"Yes" = 1,
}
const enum contact_donotemail {
"Allow" = 0,
"Do Not Allow" = 1,
}
const enum contact_donotfax {
"Allow" = 0,
"Do Not Allow" = 1,
}
const enum contact_donotphone {
"Allow" = 0,
"Do Not Allow" = 1,
}
const enum contact_donotpostalmail {
"Allow" = 0,
"Do Not Allow" = 1,
}
const enum contact_donotsendmm {
"Send" = 0,
"Do Not Send" = 1,
}
const enum contact_educationcode {
"Default Value" = 1,
}
const enum contact_familystatuscode {
"Single" = 1,
"Married" = 2,
"Divorced" = 3,
"Widowed" = 4,
}
const enum contact_followemail {
"Do Not Allow" = 0,
"Allow" = 1,
}
const enum contact_gendercode {
"Male" = 1,
"Female" = 2,
}
const enum contact_haschildrencode {
"Default Value" = 1,
}
const enum contact_isautocreate {
"No" = 0,
"Yes" = 1,
}
const enum contact_isbackofficecustomer {
"No" = 0,
"Yes" = 1,
}
const enum contact_isprivate {
"No" = 0,
"Yes" = 1,
}
const enum contact_leadsourcecode {
"Default Value" = 1,
}
const enum contact_marketingonly {
"No" = 0,
"Yes" = 1,
}
const enum contact_merged {
"No" = 0,
"Yes" = 1,
}
const enum contact_msdyn_decisioninfluencetag {
"Decision maker" = 0,
"Influencer" = 1,
"Blocker" = 2,
"Unknown" = 3,
}
const enum contact_msdyn_disablewebtracking {
"No" = 0,
"Yes" = 1,
}
const enum contact_msdyn_gdproptout {
"No" = 0,
"Yes" = 1,
}
const enum contact_msdyn_isassistantinorgchart {
"No" = 0,
"Yes" = 1,
}
const enum contact_msdyn_isminor {
"No" = 0,
"Yes" = 1,
}
const enum contact_msdyn_isminorwithparentalconsent {
"No" = 0,
"Yes" = 1,
}
const enum contact_msdyn_orgchangestatus {
"No Feedback" = 0,
"Not at Company" = 1,
"Ignore" = 2,
}
const enum contact_mspp_userpreferredlcid {
"Arabic" = 1025,
"Basque - Basque" = 1069,
"Bulgarian - Bulgaria" = 1026,
"Catalan - Catalan" = 1027,
"Chinese - China" = 2052,
"Chinese - Hong Kong SAR" = 3076,
"Chinese - Traditional" = 1028,
"Croatian - Croatia" = 1050,
"Czech - Czech Republic" = 1029,
"Danish - Denmark" = 1030,
"Dutch - Netherlands" = 1043,
"English" = 1033,
"Estonian - Estonia" = 1061,
"Finnish - Finland" = 1035,
"French - France" = 1036,
"Galician - Spain" = 1110,
"German - Germany" = 1031,
"Greek - Greece" = 1032,
"Hebrew" = 1037,
"Hindi - India" = 1081,
"Hungarian - Hungary" = 1038,
"Indonesian - Indonesia" = 1057,
"Italian - Italy" = 1040,
"Japanese - Japan" = 1041,
"Kazakh - Kazakhstan" = 1087,
"Korean - Korea" = 1042,
"Latvian - Latvia" = 1062,
"Lithuanian - Lithuania" = 1063,
"Malay - Malaysia" = 1086,
"Norwegian (Bokmål) - Norway" = 1044,
"Polish - Poland" = 1045,
"Portuguese - Brazil" = 1046,
"Portuguese - Portugal" = 2070,
"Romanian - Romania" = 1048,
"Russian - Russia" = 1049,
"Serbian (Cyrillic) - Serbia" = 3098,
"Serbian (Latin) - Serbia" = 2074,
"Slovak - Slovakia" = 1051,
"Slovenian - Slovenia" = 1060,
"Spanish (Traditional Sort) - Spain" = 3082,
"Swedish - Sweden" = 1053,
"Thai - Thailand" = 1054,
"Turkish - Türkiye" = 1055,
"Ukrainian - Ukraine" = 1058,
"Vietnamese - Vietnam" = 1066,
}
const enum contact_participatesinworkflow {
"No" = 0,
"Yes" = 1,
}
const enum contact_paymenttermscode {
"Net 30" = 1,
"2% 10, Net 30" = 2,
"Net 45" = 3,
"Net 60" = 4,
}
const enum contact_preferredappointmentdaycode {
"Sunday" = 0,
"Monday" = 1,
"Tuesday" = 2,
"Wednesday" = 3,
"Thursday" = 4,
"Friday" = 5,
"Saturday" = 6,
}
const enum contact_preferredappointmenttimecode {
"Morning" = 1,
"Afternoon" = 2,
"Evening" = 3,
}
const enum contact_preferredcontactmethodcode {
"Any" = 1,
"Email" = 2,
"Phone" = 3,
"Fax" = 4,
"Mail" = 5,
}
const enum contact_shippingmethodcode {
"Default Value" = 1,
}
const enum contact_statecode {
"Active" = 0,
"Inactive" = 1,
}
const enum contact_statuscode {
"Active" = 1,
"Inactive" = 2,
}
const enum contact_territorycode {
"Default Value" = 1,
}
const enum cp_expenseheader_statecode {
"Active" = 0,
"Inactive" = 1,
}
const enum cp_expenseheader_statuscode {
"Open" = 1,
"Closed" = 2,
"Submitted" = 121570000,
"Approved" = 121570001,
"Paid" = 121570002,
}
const enum cp_expenseline_statecode {
"Active" = 0,
"Inactive" = 1,
}
const enum cp_expenseline_statuscode {
"Active" = 1,
"Inactive" = 2,
}
const enum systemuser_accessmode {
"Read-Write" = 0,
"Administrative" = 1,
"Read" = 2,
"Support User" = 3,
"Non-interactive" = 4,
"Delegated Admin" = 5,
}
const enum systemuser_address1_addresstypecode {
"Default Value" = 1,
}
const enum systemuser_address1_shippingmethodcode {
"Default Value" = 1,
}
const enum systemuser_address2_addresstypecode {
"Default Value" = 1,
}
const enum systemuser_address2_shippingmethodcode {
"Default Value" = 1,
}
const enum systemuser_azurestate {
"Exists" = 0,
"Soft deleted" = 1,
"Not found or hard deleted" = 2,
}
const enum systemuser_caltype {
"Professional" = 0,
"Administrative" = 1,
"Basic" = 2,
"Device Professional" = 3,
"Device Basic" = 4,
"Essential" = 5,
"Device Essential" = 6,
"Enterprise" = 7,
"Device Enterprise" = 8,
"Sales" = 9,
"Service" = 10,
"Field Service" = 11,
"Project Service" = 12,
}
const enum systemuser_defaultfilterspopulated {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_deletedstate {
"Not deleted" = 0,
"Soft deleted" = 1,
}
const enum systemuser_displayinserviceviews {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_emailrouteraccessapproval {
"Empty" = 0,
"Approved" = 1,
"Pending Approval" = 2,
"Rejected" = 3,
}
const enum systemuser_incomingemaildeliverymethod {
"None" = 0,
"Microsoft Dynamics 365 for Outlook" = 1,
"Server-Side Synchronization or Email Router" = 2,
"Forward Mailbox" = 3,
}
const enum systemuser_invitestatuscode {
"Invitation Not Sent" = 0,
"Invited" = 1,
"Invitation Near Expired" = 2,
"Invitation Expired" = 3,
"Invitation Accepted" = 4,
"Invitation Rejected" = 5,
"Invitation Revoked" = 6,
}
const enum systemuser_isactivedirectoryuser {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_isallowedbyipfirewall {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_isdisabled {
"Enabled" = 0,
"Disabled" = 1,
}
const enum systemuser_isemailaddressapprovedbyo365admin {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_isintegrationuser {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_islicensed {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_issyncwithdirectory {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_msdyn_agentType {
"Application user" = 192350000,
"Bot application user" = 192350001,
}
const enum systemuser_msdyn_botprovider {
"Virtual Agent" = 192350000,
"Other" = 192350001,
"None" = 192350002,
}
const enum systemuser_msdyn_bottype {
"Microsoft Copilot Studio" = 192350001,
}
const enum systemuser_msdyn_gdproptout {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_msdyn_ischatintentenabled {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_msdyn_isexpertenabledforswarm {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_msdyn_ismultichannelintentenabled {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_msdyn_isvoiceintentenabled {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_msdyn_usertype {
"CRM User" = 192350000,
"BOT User" = 192350001,
}
const enum systemuser_outgoingemaildeliverymethod {
"None" = 0,
"Microsoft Dynamics 365 for Outlook" = 1,
"Server-Side Synchronization or Email Router" = 2,
}
const enum systemuser_preferredaddresscode {
"Mailing Address" = 1,
"Other Address" = 2,
}
const enum systemuser_preferredemailcode {
"Default Value" = 1,
}
const enum systemuser_preferredphonecode {
"Main Phone" = 1,
"Other Phone" = 2,
"Home Phone" = 3,
"Mobile Phone" = 4,
"Omnichannel Phone" = 192350005,
}
const enum systemuser_setupuser {
"No" = 0,
"Yes" = 1,
}
const enum systemuser_systemmanagedusertype {
"Entra User" = 0,
"C2 User" = 1,
"Impersonable Stub User" = 2,
"Agentic User" = 3,
"NonLicensed" = 4,
}

export interface UxAgentDataApi extends BaseUxAgentDataApi<TableRegistrations, EnumRegistrations> {}

export interface GeneratedComponentProps {
    dataApi: UxAgentDataApi;
}

