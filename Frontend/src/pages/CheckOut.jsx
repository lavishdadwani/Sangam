import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoLocationSharp, IoSearchOutline } from "react-icons/io5";
import { MdDeliveryDining } from "react-icons/md";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from "../redux/mapSlice";
import getCityName, { getAddressByLatLng } from "../../services/helpers";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import ButtonSquare from "../components/ButtonSquare";
import OrderApi from "../../services/order"
import { openSnackbar } from "../redux/snackbarSlice";
import { addMyOrder } from "../redux/userSlice";
const RecenterMap = ({location}) =>{
    if(location.lat && location.lng){
        const map = useMap()
        map.setView([location.lat,location.lng],16,{animate:true})
    }
    return null
}
const CheckOut = () => {
    const {location, address} = useSelector(state => state.map)
    const {cartItems,totalAmount, userData} = useSelector(state => state.user)
    const [addressInput, setAddressInput] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("cod")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const deliveryFee = totalAmount > 500 ? 0 : 40
    const AmountWithDeliveryFee = totalAmount + deliveryFee
    // const map = useMap()
    // useEffect(() => {
    //     setSearchLocation(address)
    // }, [address]);

    const onDragEnd = (e) => {
        const {lat,lng} = e.target._latlng
        dispatch(setLocation({lat,lng}))
        getAddressLatLng(lat,lng)
        // map.setView([lat,lng],16,{animate:true})
    }

    const  getAddressLatLng = async (lat,lng) =>{
        try{
            const result = await getCityName(lat,lng)
          if (result) {
            const cityName = result.results[0].city
            const stateName = result.results[0].state
            dispatch(setAddress(result.results[0].address_line2 || result.results[0].address_line1))
          }
        }catch(err){
            console.error(err);
        }
    }

    const getCurrentLocation = () =>{
                const latitude = userData.location.coordinates[1]
                const longitude = userData.location.coordinates[0]
                dispatch(setLocation({lat:latitude,lng:longitude}))
                getAddressLatLng(latitude,longitude)
    }

    const  getLatLngByAddress = async () =>{
        try{
            const result = await getAddressByLatLng(addressInput)
            console.log({result});
          if (result) {
            const {lat,lon} = result.results[0]
            console.log(lat,lon);
            dispatch(setLocation({lat,lng:lon}))
          }
        }catch(err){
            console.error(err);
        }
    }

    useEffect(() => {
        setAddressInput(address)
    }, [address]);

    const handlePlaceOrder = async () => {
      try {
        setLoading(true)
        const data = {
            paymentMethod,
            deliveryAddress:{
                text:addressInput,
                latitude:location.lat,
                longitude:location.lng
            },
            totalAmount:AmountWithDeliveryFee,
            cartItems
        }
        const result = await OrderApi.create(data) ;


        if (result.ok) {
            if(paymentMethod == "cod"){
                //   dispatch(setUserData(result.data.data));
                  dispatch(openSnackbar("Order Created Successfully", "success"));
                  dispatch(addMyOrder(result.data.data))
                  navigate("/order-placed")
            }else{
                const orderId = result.data.data.orderId
                const razorOrder = result.data.data.razorOrder
                openRazorPayWIndow(orderId, razorOrder)
            }
        } else {
          dispatch(openSnackbar(result.data?.message || "Failed to create order", "error"));
        }
        setLoading(false)
      } catch (err) {
        console.error(err);
        setLoading(false)
        dispatch(openSnackbar(err.message, "error"));
      }
    }

    const openRazorPayWIndow = (orderId, razorOrder)=>{
        try{
            const options = {
                key: import.meta.env.VITE_RAZORPAY_API_KEY,
                amount: razorOrder.amount,
                currency: "INR",
                name: "sangam",
                description: "Food Delivery website",
                order_id:razorOrder.id,
                handler: async function (response){
                    try{
                        const result = await OrderApi.verifyPayment({
                            razorpay_payment_id:response.razorpay_payment_id,
                            orderId
                        })
                        if (result.ok) {
                            dispatch(openSnackbar("Order Created Successfully", "success"));
                            dispatch(addMyOrder(result.data.data))
                            navigate("/order-placed")
                        }
                    }catch(err){
                        console.log(err);
                    }
                } 
            }
            const rzp = new window.Razorpay(options)
            rzp.open()
        }catch(err){
            console.log(err); 
        }
    }
 
  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div
        className="absolute top-[20px] left-[20px] z-[10]"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp size={17} className="text-[#ff4d2d]" /> Delivery
            Location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-[#ff4d2d]"
              type="text"
              id=""
              value={addressInput}
              placeholder="Enter Your Delivery Address"
              onChange={e => setAddressInput(e.target.value)}
            />
            <button className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center" onClick={getLatLngByAddress}>
                <IoSearchOutline size={17} />
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center" onClick={getCurrentLocation}>
                <TbCurrentLocation size={17} />
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
                <MapContainer className={"w-full h-full"} center={[location?.lat, location?.lng]} zoom={16}>
                <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <RecenterMap location={location} /> 
  <Marker position={[location?.lat, location?.lng]} draggable eventHandlers={{dragend:onDragEnd}}/>
                </MapContainer>
            </div>
          </div>
        </section>

        <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" :"border-gray-200 hover:border-gray-300" }`} onClick={() => setPaymentMethod("cod")}>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <MdDeliveryDining className="text-green-600 text-xl" />
                    </span>
                    <div>
                        <p className="font-medium text-gray-800">Cash On Delivery</p>
                        <p className="text-xs text-gray-500">Pay when your food arrives</p>
                    </div>
                </div>
                <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow" :"border-gray-200 hover:border-gray-300" }`} onClick={() => setPaymentMethod("online")}>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <FaMobileScreenButton className="text-purple-700 text-lg" />
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <FaCreditCard className="text-blue-700 text-lg" />
                    </span>
                    <div>
                        <p className="font-medium text-gray-800" > UPI / Credit / Debit Card</p>
                        <p className="text-xs text-gray-500">Pay Securely Online</p>
                    </div>
                </div>
            </div>
        </section>
        <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Order Summary</h2>
        <div className="rounded-xl border bg-gary-50 p-4 space-y-2">
            {cartItems.map( (item,index) =>(
                <div key={index} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} X {item.quantity}</span>
                    <span>{item.price * item.quantity}</span>
                </div>
            ))}
            <hr className="border-gray-200 my-2" />
            <div className="flex justify-between font-medium text-gray-800">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-700"> 
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : deliveryFee}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
                <span>Total</span>
                <span>{AmountWithDeliveryFee}</span>
            </div>
        </div>
        </section>
        <ButtonSquare loading={loading} onClick={handlePlaceOrder}  className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold">
            {paymentMethod == 'cod' ? "Place Order" : "Pay & Place Order"}
             </ButtonSquare>
      </div>
    </div>
  );
};

export default CheckOut;
