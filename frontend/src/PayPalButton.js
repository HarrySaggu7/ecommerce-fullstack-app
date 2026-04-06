import React, { useEffect, useRef } from "react";

const PayPalButton = ({ total, onSuccess }) => {
  const paypalRef = useRef();

  useEffect(() => {
    const PAYPAL_SCRIPT_ID = "paypal-sdk";
    const renderPayPalButtons = () => {
      if (window.paypal && paypalRef.current) {
        // Clear the container before rendering to avoid stacking multiple buttons
        paypalRef.current.innerHTML = "";
        window.paypal.Buttons({
          createOrder: async (data, actions) => {
            // Call backend to create PayPal payment
            const res = await fetch("http://localhost:8080/api/paypal/create-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ total, currency: "USD" })
            });
            const { id } = await res.json();
            return id;
          },
          onApprove: async (data, actions) => {
            // Call backend to execute payment
            const res = await fetch("http://localhost:8080/api/paypal/execute-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId: data.orderID, payerId: data.payerID })
            });
            const payment = await res.json();
            onSuccess(payment);
          },
          onError: (err) => {
            alert("Payment failed: " + err);
          }
        }).render(paypalRef.current);
      }
    };

    if (!document.getElementById(PAYPAL_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = PAYPAL_SCRIPT_ID;
      script.src = "https://www.paypal.com/sdk/js?client-id=ARWeIkgt5CCPWsM0g1eq4w6Tulgg581hSgUbIlqD2qrQqQBeZ2L6zr1vXc0VFmYEZs94XSNNfCC6v4n_&currency=USD";
      script.addEventListener("load", renderPayPalButtons);
      document.body.appendChild(script);
    } else {
      renderPayPalButtons();
    }
    // Do not remove the script on unmount to avoid SDK reload issues
    // eslint-disable-next-line
    return undefined;
    // eslint-disable-next-line
  }, [total, onSuccess]);

  return <div ref={paypalRef}></div>;
};

export default PayPalButton;
