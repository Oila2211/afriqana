import geocoder from "./geocoder.js";
import haversine from 'haversine';


const calculateDeliveryPrice = async (deliveryAddress, afriqanaAddress) => {
    try {
       const deliveryLocation = await geocoder.geocode(deliveryAddress);
       const afriqanaLocation = await geocoder.geocode(afriqanaAddress)
       
       if (deliveryLocation.length === 0 || afriqanaLocation.length === 0) {
        throw new Error('Could not geocode addresses.');
      }

      const start = {
        latitude: afriqanaLocation[0].latitude,
        longitude: afriqanaLocation[0].longitude
      };

      const end = {
        latitude: deliveryLocation[0].latitude,
        longitude: deliveryLocation[0].longitude
      };

      // Calculate the distance in kilometers
      const distance = haversine(start, end, {unit: 'km'})
      const pricePerKm = 60; //SEK
      const deliveryPrice = distance * pricePerKm;

      return deliveryPrice

    } catch (error) {
        console.error('Error calculating delivery price:', error);
        throw error
    }

    
}

export default calculateDeliveryPrice;