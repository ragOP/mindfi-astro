getCookie = function (cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};
setCookie = function (clist) {
    clist.forEach(function (item, index) {
        document.cookie =
            item.key +
            "=" +
            item.value +
            "; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    });
};
generateUUID = function () {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 =
        (typeof performance !== "undefined" &&
            performance.now &&
            performance.now() * 1000) ||
        0; //Time in microseconds since page-load or 0 if unsupported
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = Math.random() * 16; //random number between 0 and 16
            if (d > 0) {
                //Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                //Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
};
var path = new URL(document.location);
FT_UUID = "uuid_" + path.host;
if (!getCookie(FT_UUID)) {
    setCookie([
        {
            key: FT_UUID,
            value: generateUUID(),
        },
    ]);
}
var FF_UUID =getCookie(FT_UUID);
var FF_FUNNEL_PAGE_ID = document.head.querySelector(
    "meta[name=funnel_page_id]"
  ).content;
  FF_UUID=FF_UUID+"-ff-"+FF_FUNNEL_PAGE_ID;
  console.log(FF_UUID);
  console.log('<===========>');
var params = path.searchParams;
var FF_LEAD_MODE=0;
var FF_PURCHASE_MODE=0;
var FF_CAPI_CURRENCY ='INR';
var FF_CAPI_AMOUNT = 0;
var FF_CAPI_PROD_ID = 0;
var ffLeadMode = params.get("ff_lead_mode");
var ffPurchaseMode = params.get("ff_purchase_mode");
if(ffLeadMode !==null){
    FF_LEAD_MODE=1;
}else{
     FF_LEAD_MODE=0;
}
if(ffPurchaseMode !==null){
    FF_PURCHASE_MODE=1;
    FF_CAPI_CURRENCY = params.get("ff_currency");
    FF_CAPI_AMOUNT = params.get("ff_amount");
    FF_CAPI_PROD_ID = params.get("ff_product_id");
}else{
     FF_PURCHASE_MODE=0;
}
