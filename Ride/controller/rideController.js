const Ride = require("../models/rideModels");
const { publishToQueue } = require("../service/rabbitMQ");

// Create a new ride

const createRide = async (req, res) => {
  try {
    // console.log("🚖 Received Ride Creation Request:", req.body);

    const { riderName, driverName, pickupLocation, dropoffLocation, fare } = req.body;

    // Validate input
    if (!riderName || !driverName || !pickupLocation || !dropoffLocation || !fare) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (typeof fare !== "number" || fare <= 0) {
      return res.status(400).json({ message: "Fare must be a positive number" });
    }

    // Check for duplicate ride
    const existingRide = await Ride.findOne({ riderName, driverName, pickupLocation, dropoffLocation });
    if (existingRide) {
      return res.status(409).json({ message: "Ride already exists with the same details" });
    }

    // Create and save the ride
    const ride_queue = new Ride({
    user: req.user?._id || null,
      riderName,
      driverName,
      pickupLocation,
      dropoffLocation,
      fare,
    });

    const savedRide = await ride_queue.save();
    // console.log("✅ Ride Saved:", savedRide);

    // Publish ride data to RabbitMQ queue
    if (publishToQueue) {
      await publishToQueue("ride_queue", JSON.stringify(savedRide));
      console.log("📩 Ride Data Published to Queue");
    } else {
      console.error("❌ publishToQueue function is undefined");
    }

    res.status(201).json({ message: "Ride created successfully", ride: savedRide });
  } catch (error) {
    console.error("❌ Error creating ride:", error);
    res.status(500).json({ message: "Error creating ride", error: error.message });
  }
};

// Get all rides
const getAllRides = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const rides = await Ride.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (rides.length === 0) {
      return res.status(404).json({ message: "No rides found" });
    }

    res.status(200).json({ totalRides: rides.length, rides });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching rides", error: error.message });
  }
};

const getRideById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid ride ID format" });
    }

    const ride = await Ride.findById(id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.status(200).json(ride);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching ride", error: error.message });
  }
};


const acceptRide = async (req, res, next) => {
    try {
        const { rideId } = req.query; 

        if (!rideId) {
            return res.status(400).json({ message: 'Ride ID is required' });
        }

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        ride.status = 'accepted';
        await ride.save();

        try {
            await publishToQueue("ride-accepted", JSON.stringify(ride));
        } catch (queueError) {
            console.error("Failed to publish ride acceptance:", queueError);
        }

        res.status(200).json({ message: 'Ride accepted', ride });
    } catch (error) {
        console.error("Error accepting ride:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
  createRide,
  getAllRides,
  getRideById,
  acceptRide
};
