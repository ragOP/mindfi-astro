// flexiVerifier = function (res) {
//     var data = JSON.stringify(res);

//     callHTTP("https://dev.myflxfnls.com/check-payment", data, function (res) {
//         console.log(res);
//         if (res.readyState === 4) {
//             var res = JSON.parse(res.responseText);
//             window.location.href = res.body.redirect;
//         }
//     });
// };
// var data = { payment_id: params.get("payment_request_id") };
// if (!verifier(data.payment_id)) setInterval(() => flexiVerifier(data), 5000);
var torder = ["dQn48rzL4NAjGlD9", "lVdK0xqlLX4r7g9R", "P2q7Mr1J7XzxZR9A", "yDZW3rgPlMVxRQdq", "dQn48rzLznZjGlD9", "1BwmZx99DZZxNkbR", "7qDlJvJG7zKrp4zL", "M3XDnxO7ZpLxpmR0", "JeV25j71YPdr9qaM"];
var tlorder = { ftinner: "" };
if (torder.includes(FUNNEL_PAGE_ID)) {
    $(".ft-price-groups,.ft-total-groups").hide();
    tlorder.ftinner = "d-none";

}

orderverifier = function (ogres) {
    var data = JSON.stringify(ogres);
    console.log(data);
    callHTTP(BASE_URL + "/order-status", data, function (res) {
        if (res.readyState === 4) {
            var resFree = JSON.parse(res.responseText);
            if (resFree.body.status == 3) {
                var payData = JSON.stringify(resFree.body);
                console.log(payData);
                paymentLoader();
                callHTTP(BASE_URL + "/accept-pay", payData, function (acceres) {
                    if (acceres.readyState === 4) {
                        console.log(acceres.responseText);
                        if (acceres.responseText == 1) {
                            orderverifierRazCash(ogres);
                        } else {
                            console.log("iamnotwebhook");
                            var resCash = JSON.parse(acceres.responseText);
                            window.location.href = resCash.body.redirect;
                        }
                    }
                });
            }
        }
    });
};

orderverifierRazCash = function (rdata) {
    var data = JSON.stringify(rdata);
    callHTTP(BASE_URL + "/check-payment", data, function (res) {
        if (res.readyState === 4) {
            var resFree = JSON.parse(res.responseText);
            console.log(resFree);
            if (resFree.body.status == 3) {
                console.log(resFree.body.status);
                console.log(resFree.body.redirect);
                // var payData = JSON.stringify(resFree.body);
                // console.log(payData);
                //delete_cookie("flexi_tracking" + prodId);
                //delete_cookie("flexiTracking_" + $dataObject["sales_page_id"]);
                paymentLoader();
                // callHTTP(BASE_URL + "/accept-pay", payData, function (acceres) {
                //     if (acceres.readyState === 4) {
                // var resCash = JSON.parse(acceres.responseText);
                window.location.href = resFree.body.redirect;
                // }
                // });
            } //Fail
            // else if (resFree.body.status == 5) {
            //     rdata["reqAction"] = false;
            // }
            // //Progress
            // else rdata["reqAction"] = true;
        }
    });
};
paymentLoader = function () {
    let t = `
  <div id="ft-pay-loader" class="ldrprnt">
      <div class="ldrchild">
           <h6>Processing...</h6>
           <div class="d-flex" style="margin-top:15px;">
              <div>
                  <img src="https://assets.flexifunnels.com/images/ffcheckoutloader.gif">
              </div>       
              <div style="margin-left: 15px;">
                  <p style="font-size:14px;">Your transaction may take up to 30 seconds to process.</p>
                  <p style="font-size:14px;">Please do not refresh the page.</p>
              </div>     
           </div>
      </div>
  </div>`;
    $("body").append(t);
};
loadjscssfile = function (filename) {
    var fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", filename);
    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref);
};

$(document).ready(function () {
    var card,
        stripe,
        cashfree,
        stripeId = "";
    razorId = "";
    paddleId = "";

    $order = {
        form_id: "",
        c_event: null,
        coupon: { status: false },
        product: {},
        bump: [],
        ticket: { status: false, quantity: 1 },
        summary: false,
        p_title: $(".ft-product-title").attr("id"),
        p_demo: $(".ft-productDemo").attr("id"),
    };

    //PayPal Click
    $(document).on("click", ".ft-payment-orderButton", function () {
        var curObj = $(this);
        var q_params = new URL(document.location);

        $dataObject = {};
        $dataObject["integration_id"] = $(this).attr("data-integration_id");
        $dataObject["funnel_id"] = FUNNEL_ID;
        $dataObject["funnel_page_id"] = FUNNEL_PAGE_ID;
        $dataObject["site_id"] = SITE_ID;
        //If Coupon
        if ($order["coupon"].status) $dataObject["coupon"] = $order["coupon"].code;

        var formId = $(this).attr("data-formid");
        var clset_id = $(this).closest("form").attr("id");
        if (formId !== clset_id) formId = clset_id;

        $dataObject = getAssignedData($dataObject);

        if (!verifier(formId)) {
            $temp = $("#" + formId).serializeArray();
            console.log($temp);
            $temp.map(function (val) {
                $dataObject[val.name] = val.value;
            });

            //Bump offer
            var bump = [];
            var bObj = $("#" + formId).find(".ft-bumbchbox");
            bObj.each(function (index, item) {
                if ($(this).is(":checked")) {
                    var temp = {
                        bump_product_id: $(this).val(),
                        bump_price: $(this).attr("data-price"),
                    };
                    bump.push(temp);
                }
            });
            if (bump.length != 0) {
                $dataObject["bump"] = bump;
            }
        } else $dataObject = getAllFormsData($dataObject);

        //Form Default Valiation
        var formEle = $("#" + formId);
        if (!formEle[0].checkValidity()) {
            var errList = {
                empty: ["Please fill in all the required fields"],
            };
            formErrMsgShowUp(formId, errList);
            formEle[0].reportValidity();
            return false;
        }

        //Form Manual Valiation
        var res = formvalidation(formId, $dataObject); //Basic Validation
        if (res.fail == false) return false;
        else $dataObject = res.formData;

        // var ot = $(this).attr("order-temp");
        if (torder.includes(FUNNEL_PAGE_ID)) {
            //     $(".ft-input-groups,.ft-paytypes-block,.ft-temp-groups").hide();
            //     $(".ft_as_com_div").show();
            //     $(".ft-paytypes-block")
            //         .after(`<div class="ft-input-group ft-vinput-box"><label class="ft-input-label d-none"></label>
            //                 <div type="first_name" class="ft-input-block"><input type="text" name="acc_name" placeholder="Card holder name" required id="i4wua" class="ft-form-ctl ft-input-vstyle"></div></div>`);
            $("#iou0x").html("Account Verification");
            $("#i08xx").html("Please insert your payment details to verify your account.");
            $(".ft-input-groups").after('<div class="checkout-container"></div>');
            $('.ft-input-groups,.ftpaycomplete-box').hide();
            $('#i2kwj,#ifl7i,#i170l').hide();
            // return false;
        }

        if ($(curObj).hasClass("skeleton-loader")) return false;
        curObj.addClass("skeleton-loader");

        var apitype = $(this).attr("data-apitype"); //Strips
        if (apitype == "stripe") {
            $dataObject["currency"] = "inr";
            $dataObject["paymentMethodType"] = "card";
        } else paymentLoader();

        var affi = getCookie("affi_val");
        if (affi != "" && affi != 0) {
            console.log(params.get("id"));
            let product =
                params.get("id") !== null ? params.get("id") : $dataObject["p_id"];
            console.log("jav" + product);
            $dataObject["ai"] = getCookie("p" + product);
            // $dataObject["c_ai"] = getCookie("c_ai");
            $dataObject["pi"] = product;
            $dataObject["affi_val"] = getCookie("affi_val");
            $dataObject["ti"] = getCookie("ti" + product);
            $dataObject["global_affiliate"] = getCookie(q_params.host);
        }

        var noAffi = getVisitorData();
        console.log(noAffi);
        let filterProduct = noAffi.filter((d) => d.type == "product");
        var proNoAffiCookie = getCookie("p" + filterProduct[0].product_id);
        console.log(filterProduct);
        // typeof filterProduct[0].product_id == "undefined"
        var valCheckout = "fromcheckout";
        var anyCheckoutExist =
            noAffi.filter(function (o) {
                return o.hasOwnProperty(valCheckout);
            }).length > 0;
        // if (
        //     noAffi.length > 0 &&
        //     noAffi[0].type == "form" &&
        //     proNoAffiCookie == ""
        // ) {
        if (
            noAffi.length > 0 &&
            anyCheckoutExist === true &&
            proNoAffiCookie == ""
        ) {
            console.log("payment hello");
            // document.cookie =
            //     "noaffi_" +
            //     noAffi[0].form_id +
            //     "=" +
            //     pInsertId +
            //     "; path=/";
            let productD = noAffi.filter((d) => d.type == "product");
            $dataObject["noaffi"] = getCookie("noaffi_" + productD[0].product_id);
        }

        if (
            getCookie("lus_" + filterProduct[0].product_id) != null &&
            getCookie("lus_" + filterProduct[0].product_id) != ""
        ) {
            console.log("lus_" + filterProduct[0].product_id);
            $dataObject["utm"] = getCookie("lus_" + filterProduct[0].product_id);
            $dataObject["utm_id"] = getCookie(
                "lus_utm_id_" + filterProduct[0].product_id
            );
            $dataObject["touch_point"] = getCookie(
                "utm_count_" + filterProduct[0].product_id
            );
        }

        if (getCookie("chained_pro") != null && getCookie("chained_pro") != "") {
            $dataObject["chained_pro"] = getCookie("chained_pro");
        }

        // function delete_cookie(name) {
        //     document.cookie =
        //         name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        // }

        var prodId = $dataObject["p_id"];
        var affi = getCookie("p" + prodId);
        $dataObject["sales_page_id"] = getCookie("sales_page_id_" + prodId);
        $dataObject["sales_page_path"] = getCookie("current_sales_page_" + prodId);
        // delete_cookie("load_flx_affi_" + affi + "_" + prodId);
        // delete_cookie("un_vs_" + affi + "_" + prodId);
        // delete_cookie("last_paid_set");
        delete_cookies([
            "load_flx_affi_" + affi + "_" + prodId,
            "un_vs_" + affi + "_" + prodId,
            "last_paid_set",
        ]);

        // $("#" + formId).addClass("ft-processing");
        $dataObject = getUTMtracking(
            params,
            $dataObject,
            $dataObject["funnel_page_id"]
        );
        // console.log($dataObject["sales_page_id"]);
        // if ($dataObject["sales_page_id"] != "") {
        //     var uuidVal = getCookie("uuid_" + $dataObject["sales_page_id"]);
        // } else {
        //     var uuidVal = getCookie("uuid_" + path.host);
        // }
        var uuid = getCookie("uuid_" + path.host);
        $dataObject["uuid"] = uuid;
        $dataObject["utm_ffid"] = utm_ffid;

        console.log(getCookie("split_test"));
        console.log(getCookie("split_test").length);

        if (getCookie("split_test").length > 0 && getCookie("split_test") !== null) {
            // var controlPage = getCookie("control_page").split("/");
            // if (pathname + "/" == getCookie("split_slug")) {
            //     $dataObject["split_test"] = 1;
            //     $dataObject["control_page_id"] = controlPage[1];
            //     $dataObject["control_page_funnel_id"] = controlPage[0];
            //     $dataObject["control_page_split_id"] = controlPage[2];
            // }

            if (getCookie("split_sales_product_" + prodId) !== null && getCookie("split_sales_product_" + prodId) == 1) {
                $dataObject["split_test"] = 1;
                var controlPage = getCookie("control_page").split("/");
                $dataObject["control_page_id"] = controlPage[1];
                $dataObject["control_page_funnel_id"] = controlPage[0];
                $dataObject["control_page_split_id"] = controlPage[2];
            }
        }

        // $dataObject["flexi_tracking"] = getCookie("flexi_tracking" + prodId);
        $dataObject["flexi_tracking"] = getCookie("flexi_tracking" + prodId) != "" ? getCookie("flexi_tracking" + prodId) : getCookie("flexiTracking_" + FUNNEL_PAGE_ID);

        //fbp and fbc
        $dataObject["_fbp"] = getCookie("_fbp") != null ? getCookie("_fbp") : "";
        $dataObject["_fbc"] = getCookie("_fbc") != null ? getCookie("_fbc") : "";

        var data = JSON.stringify($dataObject);
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", async function () {
            if (this.readyState === 4) {
                $("#ft-pay-loader").hide().remove();
                curObj.removeClass("skeleton-loader");

                var resLam = JSON.parse(this.responseText);
                var res = resLam.body;

                //Wrong data with user End
                if (res.mode == 0) {
                    $("#" + formId).removeClass("ft-processing");
                    formErrMsgShowUp(formId, res.message);
                    return false;
                }
                // Stripe
                else if (res.payment_type == "stripe") {
                    if (res.mode == "onetime") {
                        const { error: stripeError, paymentIntent } =
                            await stripe.confirmCardPayment(res.payment_url, {
                                payment_method: {
                                    card: card,
                                },
                            });

                        if (stripeError) {
                            var errorMessage = {
                                message: [stripeError.message],
                            };
                            formErrMsgShowUp(formId, errorMessage);
                        } else if (paymentIntent.status == "succeeded") {
                            paymentIntent.payment_type = "stripe";
                            paymentIntent.product_id = prodId;
                            var data = JSON.stringify(paymentIntent);

                            callHTTP(BASE_URL + "/accept-pay", data, function (res) {
                                if (res.readyState === 4) {
                                    var resStripe = JSON.parse(res.responseText);
                                    window.location.href = resStripe.body.redirect;
                                }
                            });
                        }
                    }

                    if (res.mode == "subscription") {
                        var data;
                        data = {
                            payment_method: {
                                card: card,
                                // billing_details: {
                                //     name: $('.spj_stripe_car_name').val(),
                                //     // Comment address when you upload this code on live
                                //     /*address: {
                                //         line1: '123 Customer St',
                                //         city: 'Customer City',
                                //         postal_code: '455001',
                                //         country: 'IN' // For India
                                //     }*/
                                // },
                            },
                        }

                        stripe.confirmCardSetup(res.payment_url, data).then(function (result) {
                            if (result.error) {
                                // Handle errors (e.g., display an error message to the user)
                                var errorMessage = {
                                    message: [stripeError.message],
                                };
                                formErrMsgShowUp(formId, errorMessage);
                            } else {
                                console.log(result);
                                if (result.setupIntent.status === 'succeeded') {
                                    // Payment succeeded
                                    console.log('Payment succeeded');
                                    var confirmCard = result.setupIntent;
                                    //showLoading('Hang tight, redirecting you to the login page. You must have received account password on your email address.');
                                    confirmCard.payment_type = "stripe";
                                    confirmCard.product_id = prodId;
                                    var data = JSON.stringify(confirmCard);

                                    callHTTP(
                                        BASE_URL + "/accept-pay",
                                        data,
                                        function (res) {
                                            if (res.readyState === 4) {
                                                var resStripe = JSON.parse(
                                                    res.responseText
                                                );
                                                window.location.href =
                                                    resStripe.body.redirect;
                                            }
                                        }
                                    );
                                }
                            }
                        });
                    }
                }
                // instamojo Payment
                else if (res.payment_type == "instamojo") {
                    if (res.status == false) {
                        formErrMsgShowUp(formId, res.message);
                    } else {
                        window.location.href = res.payment_url; // Sucess

                        // Instamojo.configure({
                        //     handlers: {
                        //         onOpen: onOpenHandler,
                        //         onClose: onCloseHandler,
                        //         onSuccess: onPaymentSuccessHandler,
                        //         onFailure: onPaymentFailureHandler
                        //     }
                        // });

                        // Instamojo.open(res.payment_url);
                    }
                    return false;
                }
                //Cashfree
                else if (res.payment_type == "cashfree") {
                    if (res.status == false) {
                        formErrMsgShowUp(formId, res.message);
                    } else {
                        const success = function (data) {
                            if (data.order && data.order.status == "PAID") {
                                paymentLoader();

                                data.payment_type = "cashfree";
                                data.id = data.order.orderId;
                                var cashFreeData = JSON.stringify(data);

                                // callHTTP(
                                //     BASE_URL + "/accept-pay",
                                //     cashFreeData,
                                //     function (res) {
                                //         if (res.readyState === 4) {
                                //             var resStripe = JSON.parse(
                                //                 res.responseText
                                //             );
                                // window.location.href =
                                // "https://pay.flexifunnels.com/payment-processing-dev?order_id={order_id}";
                                //         }
                                //     }
                                // );
                                // res["reqAction"] = true;
                                setInterval(() => orderverifierRazCash(res), 5000);
                            } else {
                                alert("Order is ACTIVE");
                            }
                        };
                        let failure = function (data) {
                            alert(data.order.errorText);
                        };
                        if (res.flow_type == 2) {
                            const dropConfig = {
                                components: [
                                    "order-details",
                                    "card",
                                    "netbanking",
                                    "app",
                                    "upi",
                                    "paylater",
                                    "credicardemi",
                                    "wallets",
                                    "cardlessemi",
                                ],
                                // orderToken: res.payment_url,
                                onSuccess: success,
                                onFailure: failure,
                                style: {
                                    backgroundColor: "#ffffff",
                                    color: "#11385b",
                                    fontFamily: "Lato",
                                    fontSize: "14px",
                                    errorColor: "#ff0000",
                                    theme: "light", //(or dark)
                                },
                            };

                            $("#cashfree-form")
                                .children()
                                .remove();
                            // const paymentDom =
                            //     document.getElementById("cashfree-form");
                            // const cashfree = new Cashfree(res.payment_url);
                            // cashfree.drop(paymentDom, dropConfig);

                            const cashfree = Cashfree({
                                mode: "production" //or production
                            });

                            let checkoutOptions = {
                                paymentSessionId: res.payment_url,
                                redirectTarget: "_self"
                            };
                            cashfree.checkout(checkoutOptions);

                            $("." + res.payment_type + "_popup").addClass(
                                "show"
                            );
                        } else if (res.flow_type == 1) {
                            window.location.href = res.payment_url; // Sucess
                        }
                    }
                    return false;
                } else if (res.payment_type == "paddle") {
                    console.log(res);
                    //paddle

                    // open checkout
                    // function openCheckout(items, customer) {
                    // Paddle.Checkout.open({
                    //     settings: { showAddDiscounts: false },
                    //     // items: itemsList,
                    //     transactionId: res.payment_id,
                    //     customer: res.customer_id
                    // });

                    Paddle.Checkout.open({
                        settings: {
                            displayMode: "inline",
                            frameTarget: "checkout-container",
                            frameInitialHeight: "450",
                            frameStyle: "width: 100%; min-width: 312px; background-color: transparent; border: none;",
                            showAddDiscounts: false,
                            variant: "one-page"
                        },
                        transactionId: res.payment_id,
                        customer: res.customer_id
                    });
                    // }

                }
                // Razorpay
                else if (res.payment_type == "razorpay") {
                    var accessType = res.access_type;
                    var options = {
                        key: razorId,
                        name: res.product_name,
                        //description: "Monthly Test Plan",
                        image: "/your_logo.png",
                        // callback_url:
                        // "https://eneqd3r9zrjok.x.pipedream.net/",
                        handler: function (response) {
                            var paymentIntent = response;
                            paymentIntent.id = res.payment_url;
                            paymentIntent.payment_type = "razorpay";
                            var data = JSON.stringify(paymentIntent);

                            if (accessType == 0) {
                                callHTTP(BASE_URL + "/accept-pay", data, function (res) {
                                    if (res.readyState === 4) {
                                        paymentLoader();

                                        if (
                                            getCookie("affi_val") != "" &&
                                            getCookie("affi_val") != 0
                                        ) {
                                            setCookie([
                                                {
                                                    key: "lastpaid",
                                                    value: affi + "_" + prodId,
                                                },
                                                {
                                                    key: "firstpurchase_" + affi + "_" + prodId,
                                                    value: getCookie("ai_" + affi + "_" + prodId),
                                                },
                                            ]);
                                        } else {
                                            setCookie([
                                                {
                                                    key: "firstpurchase_noaffi_" + prodId,
                                                    value: getCookie("s_ai" + prodId),
                                                },
                                            ]);
                                        }

                                        var resFree = JSON.parse(res.responseText);
                                        delete_cookie("flexi_tracking" + prodId);
                                        delete_cookie("flexiTracking_" + $dataObject["sales_page_id"]);
                                        window.location.href = resFree.body.redirect;
                                    }
                                });
                                setInterval(() => orderverifier(res), 5000);
                            } else {
                                paymentLoader();
                                setInterval(() => orderverifierRazCash(res), 5000);
                            }
                        },
                        // modal: {
                        //     ondismiss: function () {
                        //         $("#" + formId).removeClass("ft-processing");
                        //     },
                        // },
                        prefill: {
                            name: res.customer_name,
                            email: res.customer_email,
                            contact: res.customer_mobile,
                        },
                        notes: {
                            note_key_1: "Tea. Earl Grey. Hot",
                            note_key_2: "Make it so.",
                        },
                        theme: {
                            color: "#0D94FB",
                        },
                    };

                    if (res.flow_type == 1) {
                        options.subscription_id = res.payment_url;
                        if ($dataObject["p_id"] == "57543") {
                            options.method = {
                                netbanking: false,
                                card: true,
                                upi: false,
                            };
                        }
                        if ($dataObject["p_id"] == "59402" || $dataObject["p_id"] == "61734") {
                            options.method = {
                                netbanking: false,
                                bank: false,
                                card: true,
                                upi: true,
                                qr: false
                            };
                        }
                    } else if (res.flow_type == 2) {
                        options.order_id = res.payment_url;
                        if ($dataObject["p_id"] == "59398") {
                            options.method = {
                                netbanking: false,
                                card: false,
                                upi: true,
                                wallet: false,
                                paylater: false,
                                emi: false
                            };
                        }
                        if ("59591" == $dataObject["p_id"]) {
                            options.method = {
                                netbanking: true,
                                card: false,
                                upi: false,
                                wallet: false,
                                paylater: false,
                                emi: false
                            };
                        }
                    }

                    var rzp1 = new Razorpay(options);
                    rzp1.open();
                    return false;
                }
                // Free Payment
                else if (res.payment_type == "free") {
                    var paymentIntent = {};
                    paymentIntent.id = res.payment_id;
                    paymentIntent.payment_type = "free";
                    var data = JSON.stringify(paymentIntent);

                    callHTTP(BASE_URL + "/accept-pay", data, function (res) {
                        if (res.readyState === 4) {
                            var resFree = JSON.parse(res.responseText);
                            window.location.href = resFree.body.redirect;
                        }
                    });
                }
                // Others Payment
                else window.location.href = res.payment_url;

                setInterval(() => orderverifier(res), 5000);
            }
        });
        xhr.open("POST", BASE_URL + "/process-payment");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("authorizationToken", path.host);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    }),
        $(document).on("click", "a[href*='#coupon']", function () {
            var crObj = $(".ftcoupon-row");
            var formId = $(this).attr("data-formid");
            var curObj = $(this);
            var clset_id = $(this).closest("form").attr("id");
            if (formId !== clset_id) formId = clset_id;
            $data = {};
            var c_value = $("input[name=coupon]", "#" + formId)
                .val()
                .toUpperCase();

            $data["coupon_code"] = c_value;

            if (verifier($data["coupon_code"])) {
                crObj.empty();

                if ($order["coupon"].coupon_status) {
                    $order["coupon"] = { coupon_status: false };
                    totalPayComplete($order["formObj"]);
                } else
                    crObj.append(`<span class="coupon-rejected">Coupon  is empty</span>`);
            } else {
                $order["coupon"] = { code: c_value, coupon_status: true };
                $order["c_event"] = curObj;
                if (curObj.hasClass("skeleton-loader")) return false;
                curObj.addClass("skeleton-loader");
                cartCheckFun({});
            }
            return false;
        }),
        $(document).on("click", ".coupon-reicon", function () {
            $order["coupon"] = { coupon_status: false };
            $("input[name=coupon]").val("");
            cartCheckFun({});
            $(this).parent().empty();
        }),
        $(document).on("click", 'span[data-field="quantity"]', function (e) {
            var action = $(this).attr("data-action");
            var qObj = $("input[name=quantity]", $order["formObj"]);
            var quantityVal = qObj.val();
            var currentVal = !isNaN(quantityVal) ? parseInt(quantityVal) : 1;

            if (action == 0) {
                //DECREASE
                if (currentVal > 1) currentVal--;
            } else if (action == 1) {
                //INCREASE
                var dataPerBooking = $(this).attr("data-per-booking");
                if (dataPerBooking > currentVal) currentVal++;
            }

            qObj.val(currentVal);
            $order["ticket"] = { status: true, quantity: currentVal };
            cartCheckFun({});
        }),
        (cartCheckFun = function ($data) {
            $data["pricing_id"] = $order["pricing"].product_id;
            $data["product_id"] = $order["product"].product_id;
            if ($order["bump"].length !== 0) $data["bump"] = $order["bump"];

            if ($order["coupon"].coupon_status)
                $data["coupon_code"] = $order["coupon"].code;

            if ($order["ticket"].status) $data["ticket"] = $order["ticket"];

            if ($order["ticket"].status || $order["coupon"].coupon_status) {
                var data = JSON.stringify($data);

                callHTTP(BASE_URL + "/cart-check", data, function (res) {
                    if (res.readyState === 4 && res.response) {
                        var res = JSON.parse(res.response).body;

                        //SUMMARY RES
                        $order["summary"] = res;
                        //TICKET RES
                        // $order["ticket"].status = res.ticket_status;
                        $order["ticket_status"] = res.ticket_status;
                        //COUPON RES

                        if ($order["coupon"].coupon_status) {
                            $order["coupon"] = res;
                            $order["c_event"].removeClass("skeleton-loader");

                            // $order["coupon"].active = res.coupon_status;
                            var crObj = $(".ftcoupon-row");
                            if (!res.coupon_status) {
                                crObj
                                    .empty()
                                    .append(
                                        `<span class="coupon-rejected"> ${$order["coupon"].coupon_message} </span>`
                                    );
                            } else {
                                crObj.empty().append(
                                    `<span class="coupon-accepted"><i class="ftpointer coupon-reicon"><svg width="13" height="13" viewBox="0 0 16 16">
                          <path d="M21,6.611,19.389,5,13,11.389,6.611,5,5,6.611,11.389,13,5,19.389,6.611,21,13,14.611,19.389,21,21,19.389,14.611,13Z" transform="translate(-5 -5)"/>
                        </svg></i> ${res.code} is applied</span>`
                                );
                            }
                        }
                        console.log($order["formObj"]);
                        totalPayComplete($order["formObj"]);
                    }
                });
            } else totalPayComplete($order["formObj"]);
        }),
        (totalPayComplete = function (formObj) {
            $box = true;

            $price = parseFloat($order["pricing"].price);
            $currency = $order["product"].currency;
            if ($price == 0 && $order["bump"].length == 0) $box = false;

            // if ($box) formObj.find(".ftpaycomplete-inner").fadeIn();
            // else formObj.find(".ftpaycomplete-inner").fadeOut();

            var t_obj = { t_block: "", up_msg: "", down_msg: "" };
            var other_data = $order["product"].other_data;
            if (!verifier(other_data) && !verifier(other_data.ticket)) {
                var ticket = other_data.ticket;
                var qan = $("input[name=quantity]").val();
                if (qan > 0) quantityVal = qan;
                else quantityVal = 1;

                if (ticket.remainingtickets === 1) {
                    var t = ticket.quantity - $order["product"].no_of_sold;
                    t_obj.up_msg += `              
              <div class="ft-err-groups">
                  <div class="ff_maxticketinfo">
                          <span><b>Note</b> - <span> Only ${t}</span> Tickets Left.</span>
                  </div>
              </div>`;
                }

                if (ticket.ticketcustomnote === 1 && ticket.custom_notes) {
                    t_obj.up_msg = `<div class="ft-err-groups">
                  <div class="ff_maxticketinfo">
                  <span> ${ticket.custom_notes}. </span>
                </div></div>`;
                }

                if (ticket.status == 1) {
                    var per_booking = ticket.per_booking;

                    var t_class = { in_c: "", de_c: "" };

                    if (per_booking <= quantityVal) {
                        t_class.in_c = "ff_opacity ff_peventsnone";

                        t_obj.down_msg += `<div class="ft-err-groups">
                  <div class="ff_maxticketinfo">
                      <span><b>Note</b> - You cannot add more than ${per_booking} tickets.</span>
                </div></div>`;
                    } else if (quantityVal <= 1)
                        t_class.de_c = "ff_opacity ff_peventsnone";

                    t_obj.t_block = `<li  class="ftorder-ticket-row">
              <span>
                 <span>Total Quantity</span>

                 <em class="d-flex">
                    <span class="d-flex mr-1 ftpointer ${t_class.de_c}" data-quantity="minus" data-field="quantity" data-action="0" data-per-booking="${per_booking}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                          <g  transform="translate(-1177 -623)">
                             <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5,11H7V11H17Z" transform="translate(1175 621)"/>
                          </g>
                      </svg>
                    </span>

                    <span class="d-flex" style="width:20px;">
                          <input class="ff_cuntval" type="number" name="quantity" value="${quantityVal}" readonly />
                    </span> 

                    <span class="d-flex ml-1 ftpointer ${t_class.in_c}"  data-quantity="plus" data-field="quantity" data-action="1"  data-per-booking="${per_booking}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                          <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5,11H13v4H11V13H7V11h4V7h2v4h4Z" transform="translate(-2 -2)"/>
                       </svg>
                    </span>
                 </em>
              </span>
           </li>`;
                }
            }

            var ele = ``;
            //ERROR_UP declare
            ele = `<div class="ft-err-up">${t_obj.up_msg}</div>`;
            ele += `<h6 id="${$order["p_title"]}" class="ftorder-summary">Order Summary</h6><ul id="${$order["p_demo"]}" class="ftorder-details">`;

            //TICKET declare
            console.log($order);
            ele += t_obj.t_block;
            if (
                $order["ticket_status"] &&
                !verifier($order["summary"].ticket_discount)
            ) {
                ele += `<li class="ftorder-details-row"> <span><span>Total</span><em>${$currency}&nbsp;${$order["summary"].ticket_total} </em></span> </li>`;
                if ($order["summary"].ticket_discount > 0) {
                    ele += `<li class="ftorder-details-row"><span><span>Ticket discount (${$order["summary"].ticket_discount_percent}%) </span> <em>- ${$currency}&nbsp;${$order["summary"].ticket_discount} </em></span></li>`;
                }
            } else {
                ele += ` <li class="ftorder-details-row"> <span><span>Total</span><em>${$currency}&nbsp;${$price} </em></span> </li>   `;
            }

            //BUMB declare
            $order["bump"].forEach(function (item, index) {
                $bprice = item.bump_price;
                ele += ` <li class="ftorder-details-row"> <span><span>${item.title}</span><em>${$currency}&nbsp;${$bprice} </em></span> </li>`;
                $price += parseFloat($bprice);
            });

            //COUPON declare
            var coupon = $order["coupon"];
            if (coupon.coupon_status) {
                ele += `<li class="ftorder-details-row"><span><span>Coupon discount</span> <em>${$currency}&nbsp;${coupon.coupon_discount} </em> </span> </li>`;
                $price = coupon.afterDiscount;
            }

            //SUMMARY declare
            var total = $order["summary"].status
                ? $order["summary"].afterDiscount
                : $price.toFixed(2);

            ele += `<li class="ftorder-details-total"> <span><span>Order Total</span><em>${$currency}&nbsp;${total} </em></span></li>`;
            ele += `</ul>`;

            //ERROR_DOWN declare
            ele += `<div class="ft-err-down"> ${t_obj.down_msg} </div>`;

            $("form").each(function (index, item) {
                var tgroups = $(this).find(".ft-total-groups");
                if (tgroups.length != 0) {
                    $(this).find(".ft-total-groups").empty().append(ele);
                } else {
                    $(this)
                        .find(".ft-price-groups")
                        .after(
                            `<div class="ft-total-groups ${tlorder.ftinner}">${ele}</div>`
                        );
                }
            });

            // var tgroups = formObj.find(".ft-total-groups");
            // if (tgroups.length != 0) {
            //     formObj.find(".ft-total-groups").empty().append(ele);
            // } else {
            //     formObj
            //         .find(".ft-price-groups")
            //         .after(`<div class="ft-total-groups">${ele}</div>`);
            // }
        });

    $(document).on("click", ".ft-pricelist", function (e) {
        var formObj = $(this).closest("form");
        $order["pricing"] = {
            product_id: $(this).val(),
            price: $(this).attr("data-price"),
            currency: $(this).attr("data-currency"),
            title: $(this).attr("data-title"),
        };
        var bumbObj = formObj.find(".ft-bumbchbox");
        var bump = [];
        bumbObj.each(function (index, item) {
            if ($(this).is(":checked")) {
                var temp = {
                    bump_product_id: $(this).val(),
                    bump_price: $(this).attr("data-price"),
                    title: $(this).attr("data-title"),
                };
                bump.push(temp);
            }
        });
        $order["bump"] = bump;
        $order["formObj"] = formObj;
        cartCheckFun({});
    }),
        $(document).on("click", ".ft-bumbchbox", function (e) {
            var formObj = $(this).closest("form");

            var bumbObj = formObj.find(".ft-bumbchbox");
            var bump = [];
            bumbObj.each(function (index, item) {
                if ($(this).is(":checked")) {
                    var temp = {
                        bump_product_id: $(this).val(),
                        bump_price: $(this).attr("data-price"),
                        title: $(this).attr("data-title"),
                    };
                    bump.push(temp);
                }
            });
            $order["bump"] = bump;
            cartCheckFun({});
        }),
        $(document).on("click", ".ft-paylist", function (e) {
            e.stopPropagation(),
                ($type = $(this).val()),
                ($index = $(this).attr("data-index")),
                ($formId = $(this).attr("data-formid"));
            var curForm = $("#" + $formId);
            if (curForm.length == 0) {
                $formId = $(this).closest("form").attr("id");
                curForm = $("#" + $formId);
            }

            //$('.ft-pay-block').children().hide();
            $("#" + $formId)
                .find(".ft-payblk-com")
                .hide();
            $("#" + $type + "_block_" + $index).fadeIn();

            var api_type = $(this).attr("data-apitype");
            var integration_id = $(this).attr("data-integration_id");
            curForm.find(".ft-payment-orderButton").attr({
                "data-apitype": api_type,
                "data-integration_id": integration_id,
            });

            if ($type == "stripe") {
                // stripe = Stripe(
                //     "pk_live_CpFuZk2O62BJOoco92ftg4kj00Mf75u1mA", {
                //         apiVersion: "2020-08-27"
                //     }
                // );
                stripe = Stripe(stripeId, {
                    apiVersion: "2020-08-27",
                });

                var style = {
                    base: {
                        lineHeight: "30px",
                        fontSize: "16px",
                        border: "1px solid #ced4da",
                    }
                };

                const elements = stripe.elements();
                card = elements.create("card", { style: style });
                card.mount(`#stripe-ref-${$index}`);
            }
            console.log($type);
            if ($type == "paddle") {
                setTimeout(function () {

                    //Paddle.Environment.set("sandbox");
                    Paddle.Initialize({
                        token: paddleId, // replace with a client-side token
                        eventCallback: function (data) {
                            console.log(data);
                            if (data.name == "checkout.loaded") {
                                Paddle.Spinner.hide();
                            };
                            if (data.name == "checkout.completed") {
                                var paymentIntent = data.data;
                                paymentIntent.payment_type = "paddle";
                                //paymentIntent.product_id = prodId;
                                paymentIntent.id = data.data.transaction_id;
                                // paymentIntent.data = data;
                                var data = JSON.stringify(paymentIntent);

                                callHTTP(
                                    BASE_URL + "/accept-pay",
                                    data,
                                    function (res) {
                                        if (res.readyState === 4) {
                                            var resStripe = JSON.parse(
                                                res.responseText
                                            );
                                            window.location.href =
                                                resStripe.body.redirect;
                                        }
                                    }
                                );
                            }
                        }
                    });
                }, 2000)
            }

            if ($type == "instamojo") {
                // cashfree = new Cashfree();
                // const paymentDom = document.getElementById("cashfree-form");
                // const elements = stripe.elements();
                // card = elements.create("card");
                // card.mount(`#stripe-ref-${$index}`);
            }
        });

    // **********************************************
    // ************** Oderform begin*****************
    // **********************************************

    appendProduct = function ($pObj) {
        // console.log($pObj);

        //pricing assign
        if ($pObj["pricing"]) {
            var priceLength = $pObj["pricing"].length;
            var rmPaymentOpt = "";

            $(".ft-productDemo").remove();
            $.each($pObj["pricing"], function (index, item) {
                var checked = "";
                var priceId = `prd_${item.pricing_id}_${index}`;
                if (index == 0) rmPaymentOpt = priceId;

                if (priceLength == 1) {
                    rmPaymentOpt = priceId;
                    checked = "checked";
                } else if (priceLength > 1 && item.preferred == 1) {
                    rmPaymentOpt = priceId;
                    checked = "checked";
                }

                let price =
                    item.type != "subscription"
                        ? item.price
                        : item.subscription_price;

                if ($pObj["pricing"][0].type !== "ownprice") {
                    var htmlEl = `
                <tr id="${$order["p_demo"]}" class="ft-productDemo">;
                     <td class="form-check-inline"> 
                        <input id="${priceId}" class="ft-pricelist mr-2" type="radio"  name="pricing_id" data-price="${price ? price : 0
                        }" data-title="${item.product_title}" data-currency="${item.currency
                        }" value="${item.pricing_id}" ${checked} >
                         <label style="cursor:pointer;" for="prd_${item.pricing_id
                        }_${index}" >${item.product_title} (${item.pricing_name
                        })</label>
                    </td>
                   <td style="text-align:right;">${$pObj["product"].currency}&nbsp;&nbsp;${price}</td>
                </tr>`;
                } else {
                    $(".ft-itemlabel").hide();
                    $(".ft-pricelabel").css("text-align", "left");

                    var htmlEl = `                     
                <tr id="${$order["p_demo"]}" class="ft-productDemo">
                     <td > 
                        <input id="${priceId}" class="ft-pricelist mr-2 d-none" type="radio"  name="pricing_id" data-price="${price ? price : 0
                        }" data-title="${item.product_title}" data-currency="${item.currency
                        }" value="${item.pricing_id}" ${checked} >
                         <label style="cursor:pointer;" for="prd_${item.pricing_id
                        }_${index}" >${item.product_title} (${item.pricing_name
                        })</label>

                         <input type="number" name="custom_price" placeholder="Enter Amount" required="true" class="ft-form-ctl ft-input-vstyle ft-fcustom_price">  
                    </td>
                </tr>
                `;
                }

                $(".ft-froductOptionsBox").append(htmlEl);

                $(".ft-productWrapper").css("opacity", "unset");

                // if (index == 0) {
                //     $iLists = `
                //     <input  type="hidden" name="product_title" value="${$pObj["product"].product_title}">
                //     <input  type="hidden" name="product_description" value="${$pObj["product"].product_description}">
                //     <input  type="hidden" name="product_id" value="${$pObj["product"].product_id}">`;

                // var fromBox = $("body").find(".ft-froductformBox");
                // if (fromBox.length == 1) {
                // $(".ft-froductOptionsBox").append($iLists);
                // } else $("body").append($iLists);
                //}
            });
        }
        // var getPriceTextId = $("body").find(".ft-productDemo");

        // product assign
        if ($pObj["product"]) {
            $order["product"] = $pObj["product"];
            if (
                !verifier($order["product"].other_data) &&
                !verifier($order["product"].other_data.ticket)
            )
                $order["ticket"] = { status: true, quantity: 1 };

            $iLists = `
          <input  type="hidden" name="product_title" value="${$pObj["product"].product_title}">
          <input  type="hidden" name="product_description" value="${$pObj["product"].product_description}">
          <input  type="hidden" name="product_id" value="${$pObj["product"].product_id}">
          <input  type="hidden" name="p_id" value="${$pObj["product"].p_id}">`;

            // var fromBox = $("body").find(".ft-froductformBox");
            // if (fromBox.length == 1) {
            $(".ft-froductOptionsBox").append($iLists);
        }

        if ($pObj.fid) {
            $fidHtml = `<input  type="hidden" name="fid" value="${$pObj.fid}">`;
            $(".ft-froductOptionsBox").append($fidHtml);
            // var fromBox = $("body").find(".ft-froductformBox");
            // if (fromBox.length == 1)
            //     $(".ft-froductformBox").append($fidHtml);
            // else $("body").append($fidHtml);
        }

        if ($pObj.ffid) {
            $ffidHtml = `<input  type="hidden" name="ffid" value="${$pObj.ffid}">`;
            $(".ft-froductOptionsBox").append($ffidHtml);
            // var fromBox = $("body").find(".ft-froductformBox");
            // if (fromBox.length == 1)
            //     $(".ft-froductformBox").append($ffidHtml);
            // else $("body").append($ffidHtml);
        }

        //Terms of Sales
        var terms = "";
        if ($pObj["affiliate"]) {
            terms = `<div class="ft-terms-groups">
                              <div><span  class="ft-terms-header">Terms of Sales</span></div>
                              <ul class="ftterms-details">                                
                                  <li>All Fraud will be prosecuted. Your IP is <strong>${$pObj["ip"]}</strong>. You have been referred by <strong>${$pObj["affiliate"].name} (#${$pObj["affiliate"].id})</strong>.</li>
                                  <li  class="d-none">This product is created and sold by <strong>${$pObj["affiliate"].name}</strong>, the product's vendor.</li>
                              </ul>
                          </div>`;
        }

        var btnOrder = $("body").find(".ftButton-order");
        btnOrder.each(function (index, item) {
            var formId = $(item).attr("data-formid");
            var curForm = $("#" + formId);
            if (curForm.length == 0) {
                formId = $(item).closest("form").attr("id");
                curForm = $("#" + formId);
            }

            // GST assign
            if ($pObj["product"]["gst_mode"] == 1) {
                var gst = `
            <div class="ft-input-group ft-vinput-box" style="text-align:left;margin-top: 10px;"><label class="ft-input-label d-none" id="ioaaw"></label><div type="checkbox" class="ft-input-block"><div sizing="small" class="ft-radio-groups"><div class="form-check form-check-inline"><input type="checkbox" id="radio_0xV8Ec" name="ft_chk_gst" value="1" class="ft-form-ctl form-check-input"><label for="radio_0xV8Ec" class="form-check-label ft-check-label" id="istzf">Add GST details (optional)</label></div> </div></div></div>

            <div class="ft-gst-inputs d-none">

                <div class="ft-input-group ft-vinput-box"><label class="ft-input-label" id="ih6tj">GSTIN</label><div type="gstin" class="ft-input-block"><input type="text" name="gstin" placeholder="Enter GSTIN" value=""  class="ft-input-height ft-form-ctl ft-input-vstyle pholder_flexiForm_3cyzF ft-gstin-input" id="igd4i"></div></div>

                <div class="ft-input-group ft-vinput-box"><label class="ft-input-label" id="ippdz">Company Name</label><div type="company_name" class="ft-input-block"><input type="text" name="company_name" placeholder="Enter Company Name" value=""  class="ft-input-height ft-form-ctl ft-input-vstyle pholder_flexiForm_3cyzF" id="ijvpj"></div></div>

            </div>
            `;
                curForm
                    .find(".ft-input-groups")
                    .after(`<div class="ft-gst-groups">${gst}</div>`);
            }


            // BumpOffer assign
            //console.log($pObj["bump"]);
            $.each($pObj["bump"], function (bIndex, bItem) {
                var ele = addBumbProduct(bItem);
                var bgrp = curForm.find(".ft-bump-groups");
                if (bgrp.length != 0) {
                    curForm.find(".ft-bump-groups").append(ele);
                } else {
                    curForm
                        .find(".ft-input-groups")
                        .after(`<div class="ft-bump-groups">${ele}</div>`);
                }
            });

            //payment assign
            var pay_block = "";
            var pay_details = "";
            $.each($pObj.payments, function (inx, item) {
                var chk = inx == 0 ? "checked" : "";
                pay_block += `<div class="form-check form-check-inline">
                  <input data-formid="${formId}" data-index="${index}" data-apitype="${item.api_type
                    }" data-integration_id="${item.integration_id}" id="${"ft-paylist_" + index + item.integration_id
                    }" class="form-check-input ft-paylist" type="radio" name="paymentcommonradio" value="${item.api_type
                    }" ${chk}>
                  <label class="form-check-label" for="${"ft-paylist_" + index + item.integration_id
                    }"> 
                     ${item.label}
                  </label>
                </div>`;

                if (item.api_type == "stripe") {
                    loadjscssfile("https://js.stripe.com/v3/");
                    stripeId = item.publish_key;
                    pay_details += `
                  <div id="${item.api_type + "_block_" + index
                        }" class="ft-payblk-com" style="display:none;">
                      <div class="text-center mt-3">
                          <div id="stripe-ref-${index}" class="ft-strip-card"></div>
                           <button data-integration_id="${item.integration_id
                        }"  type="button" class="d-none btn btn-success btn-lg ft-payment-stripe w-100 mt-3" style="font-weight:700;">Complete Order <i class="fas fa-arrow-circle-right"></i></button>
                      </div>
                  </div>`;
                } else if (item.api_type == "paddle") {
                    //paddle
                    loadjscssfile("https://cdn.paddle.com/paddle/v2/paddle.js");
                    paddleId = item.client_key;

                    pay_details += `<div id="${item.api_type + "_block_" + index
                        }" class="ft-payblk-com text-center mt-3"  style="display:none;">
                    <img src="${item.image}" class="w-100"/>
                    <button data-integration_id="${item.integration_id
                        }"  type="button" class="d-none btn btn-success btn-lg ft-payment-orderButton w-100 mt-3">Complete Order <i class="fas fa-arrow-circle-right"></i></button>
                    </div>
                    `;
                } else if (item.api_type == "razorpay") {
                    loadjscssfile("https://checkout.razorpay.com/v1/checkout.js");
                    razorId = item.key_id;
                    pay_details += `<div id="${item.api_type + "_block_" + index
                        }" class="ft-payblk-com text-center mt-3"  style="display:none;">
                  <img src="${item.image}" class="w-100"/>
                  <button data-integration_id="${item.integration_id
                        }"  type="button" class="d-none btn btn-success btn-lg ft-payment-orderButton w-100 mt-3">Complete Order <i class="fas fa-arrow-circle-right"></i></button>
                  </div>
                  `;
                } else if (item.api_type == "instamojo") {
                    loadjscssfile("https://js.instamojo.com/v1/checkout.js");
                    // razorId = item.key_id;
                    pay_details += `<div id="${item.api_type + "_block_" + index
                        }" class="ft-payblk-com text-center mt-3"  style="display:none;">
                  <img src="${item.image}" class="w-100"/>
                  <button data-integration_id="${item.integration_id
                        }"  type="button" class="d-none btn btn-success btn-lg ft-payment-orderButton w-100 mt-3">Complete Order <i class="fas fa-arrow-circle-right"></i></button>
                  </div>
                  `;
                } else if (item.api_type == "cashfree") {
                    loadjscssfile(
                        "https://sdk.cashfree.com/js/v3/cashfree.js"
                    );
                    pay_details += `<div id="${item.api_type + "_block_" + index
                        }" class="ft-payblk-com text-center mt-3"  style="display:none;">
                      <img src="${item.image}" class="w-100"/>
                      <div class="text-center mt-3">
                          <div data-popupbgclose="yes" class="ff-modal-bg ff-modal-popup ${item.api_type + "_popup"
                        }" style="background-color:rgba(0, 0, 0, 0.5)">
                              <div id="cashfree-form" class="ff-modal-div ff-poup-position ff-modal-centered"></div>
                          </div>
                      </div>
                  </div>
                  `;
                } else {
                    pay_details += `<div id="${item.api_type + "_block_" + index
                        }" class="ft-payblk-com text-center mt-3"  style="display:none;">
                  <img src="${item.image}" class="w-100"/>
                  <button data-integration_id="${item.integration_id
                        }"  type="button" class="d-none btn btn-success btn-lg ft-payment-orderButton w-100 mt-3">Complete Order <i class="fas fa-arrow-circle-right"></i></button>
                  </div>
                  `;
                }
            });
            if ($pObj["pricing"][0].type !== "ownprice")
                var ftpaycomplete_inner = "";
            else var ftpaycomplete_inner = "";

            var torder = ["dQn48rzL4NAjGlD9", "lVdK0xqlLX4r7g9R", "P2q7Mr1J7XzxZR9A", "yDZW3rgPlMVxRQdq", "dQn48rzLznZjGlD9", "1BwmZx99DZZxNkbR", "7qDlJvJG7zKrp4zL", "M3XDnxO7ZpLxpmR0", "JeV25j71YPdr9qaM"];
            var ffbtnTxt = 'Complete Order';
            if (torder.includes(FUNNEL_PAGE_ID)) {
                ffbtnTxt = 'Create Account';
            }
            var pay_layout = `<div class="ftpaycomplete-box text-left ft-skelecton">
                        <div class="ftpaycomplete-inner ${ftpaycomplete_inner} ${tlorder.ftinner}">
                            <div class="ft-paytypes-block">
                                <div> <h5 id="${$order["p_title"]}" class="ft-product-title">Pay via</h5></div>
                                <div id="${$order["p_demo"]}" class="ft-pay-checkbox">
                                  ${pay_block}
                                </div>
                            </div>
                            <main>
                                <div class="ft-pay-block">${pay_details} </div>
                            </main>
                        </div>
                        <div class="ftpaycomplete-button">
                            <button type="button" class="btn btn-success btn-lg ft-payment-orderButton w-100 mt-3" style="font-weight:700;">${ffbtnTxt} <i class="fas fa-arrow-circle-right"></i></button>
                        </div>
                        ${terms}
                  </div>`;
            $(pay_layout).replaceAll($(item));

            var fobj = $("#" + formId)
                .find(".ft-paylist")
                .first();
            var type = fobj.val();

            if (type !== "stripe") fobj.click();
            else {
                setTimeout(function () {
                    fobj.click();
                }, 1000);
            }

            // setTimeout(function () {
            $("#" + formId)
                .find(".ft-btnorder-box")
                .removeClass("ft-btnorder-box");
            $("#" + formId).removeClass("flexi-orderform");
            $("#" + formId)
                .find(".ft-skeleton")
                .removeClass("ft-skeleton");
            // }, 1000);

            if (rmPaymentOpt !== "") $("#" + rmPaymentOpt).click();

            affiliateRequest();
            disableformFields();
        });
    };
    addBumbProduct = function (bItem, formId) {
        var st = JSON.parse(bItem.style);
        var ele = `
      <div class="ft-bump-group" style="background-color:${st.bumpbgcolor
            };border-radius:${st.borderradius}px;border:${st.bordernumber}px ${st.borderStyle
            } ${st.bumpborderbgcolor};">
          <div>
              <span class="mr-2">
                  <input id="chbox_${bItem.bump_product_id
            }" class="ft-bumbchbox" type="checkbox" data-price="${bItem.bump_price
            }" data-title="${bItem.bump_name}" value="${bItem.bump_product_id}"  ${bItem.bump_option === "1" ? 'checked="checked"' : ""
            }  />
              </span>
              <label for="chbox_${bItem.bump_product_id}">
                  ${bItem.headcontent}
              </label>
          </div>
          <div>
              ${bItem.subheadcontent}
          </div>
          <div>
              ${bItem.bumpdescontent}
          </div>
      </div>`;
        return ele;
    };

    $prObj = $("body").find(".ft-productWrapper");
    if ($prObj.length !== 0) {
        //If Orderform
        var data = {};
        var uuid = getCookie("uuid_" + path.host);
        data["uuid"] = uuid;
        if (verifier(product_id)) {
            data["path"] = path;
        } else {
            data["product_id"] = product_id;
            data["path"] = path;
        }

        if (!verifier(fid)) {
            data["fid"] = fid;
            data["ffid"] = ffid;
            data["path"] = path;
        }

        let q_params = new URL(document.location);
        hostAffiliateId = getCookie(q_params.host);
        if (hostAffiliateId !== null) {
            data["a_id"] = hostAffiliateId;
        }
        var data = JSON.stringify(data);
        callHTTP(BASE_URL + "/order-details", data, function (res) {
            if (res.readyState === 4) {
                var res = JSON.parse(res.responseText);
                // console.log(res.body.product);
                analsysts(res.body.product.p_id, 0);
                if (res.body.bump.length > 0) {
                    res.body.bump.map(function (bump) {
                        console.log(bump);
                        bump.p_id = res.body.product.p_id;
                        // alert();
                        analsysts(0, bump);
                    });
                }
                appendProduct(res.body);
            }
        });
    }
    //Not orderform
    else {
        affiliateRequest();
    }
    // **********************************************
    // ************** Oderform close*****************
    // **********************************************

    // function onOpenHandler() {
    //     // alert("Payments Modal is Opened");
    // }

    // function onCloseHandler() {
    //     // alert("Payments Modal is Closed");
    // }

    // function onPaymentSuccessHandler(response) {
    //     // alert("Payment Success");
    //     // console.log("Payment Success Response", response);
    // }

    // function onPaymentFailureHandler(response) {
    //     // alert("Payment Failure");
    //     // console.log("Payment Failure Response", response);
    // }

    $(document).on("keyup", "input[name='custom_price']", function () {
        var price = $(this).val();
        $order["pricing"]["price"] = price ? price : 0;
        cartCheckFun({});
    });
    $(document).on("keydown", "input[name='custom_price']", function (e) {
        if (e.which != 8 && e.which != 0 && e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
    });
    $(document).on("change", "input[name='ft_chk_gst']", function () {
        if ($("input[name='ft_chk_gst']").is(":checked")) {
            $(".ft-gstin-input").prop("required", true);

            $(".ft-gst-inputs").removeClass("d-none");
        } else {
            $(".ft-gstin-input").prop("required", false);
            $(".ft-gst-inputs").addClass("d-none");
        }
    });
    disableformFields = function () {
        var allinput = $(".flexi-form[flexcheckdefault] .ft-input-groups").find(
            "input,textarea,select"
        );

        var VishalEle = allinput.not(
            '[name="name"],[name="first_name"],[name="last_name"],[name="email"],[name="phone"]'
        );

        if (!$(".ft-bumbchbox").is(":checked")) VishalEle.hide();
        $(document).on("click", ".ft-bumbchbox", function (e) {
            if ($(this).is(":checked")) {
                VishalEle.each(function (index, item) {
                    var required = $(this).attr("ftrequired");
                    if (!verifier(required)) {
                        $(this).attr("required", true);
                        $(this).removeAttr("ftrequired");
                    }
                });

                VishalEle.show();
            } else {
                VishalEle.each(function (index, item) {
                    var required = $(this).attr("required");
                    if (!verifier(required)) {
                        $(this).removeAttr("required");
                        $(this).attr("ftrequired", true);
                    }
                });
                VishalEle.hide();
            }
        });
    };
});
