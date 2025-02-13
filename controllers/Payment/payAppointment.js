const ClinicWallet = require("../../models/ClinicWallet");
const stripe = require("stripe")(process.env.SECRET_KEY);

const {
  validatePatient,
  validateAppointment,
  validateDoctor,
  validatePackage,
} = require("../../utils/validator");

function getDiscountAmountForAppointments(package) {
  if (package == "Free") {
    return 0;
  } else if (package == "Silver") {
    return 0.4;
  } else if (package == "Gold") {
    return 0.6;
  } else if (package == "Platinum") {
    return 0.8;
  } else {
    console.error("Invalid package");
  }
}

payWithWallet = async (patientUsername, appointmentId, res) => {
  try {
    console.log("in the pay with wallet");
    const appointment = await validateAppointment(appointmentId, res);
    const doctor = await validateDoctor(appointment.doctorUsername, res);
    const patient = await validatePatient(patientUsername, res);
    const package = await validatePackage(
      patient.healthPackage.membership,
      res
    );
    let price = doctor.hourlyRate + 0.1 * doctor.hourlyRate;
    let clinicWallet = await ClinicWallet.find();
    clinicWallet = clinicWallet[0];

    const hours = Math.abs(
      parseInt(appointment.startHour) - parseInt(appointment.endHour)
    );
    price *= hours;
    price -= price * (package.sessionDiscount / 100);
    if (patient.wallet < price) {
      return res.status(402).json({ message: "Insufficient funds" });
    }
    patient.wallet -= price;
    doctor.wallet += hours * doctor.hourlyRate;
    clinicWallet.Wallet += 0.1 * doctor.hourlyRate;
    appointment.patient = patientUsername;
    await patient.save();
    await appointment.save();
    await doctor.save();
    await clinicWallet.save();

    handlePatientAppointmentNotification(patient, appointment, doctor);
    handleDoctorAppointmentNotification(doctor, patient, appointment);

    res.status(200).json({
      message: "Appointment booked successfully",
      data: {
        id: appointment._id,
        doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        patientName: `${patient.firstName} ${patient.lastName}`,
        date: appointment.date,
        startHour: appointment.startHour,
        endHour: appointment.endHour,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const payAppointment = async (req, res) => {
  const { patientUsername, appointmentId } = req.params;
  const { paymentMethod } = req.body;
  const patient = await validatePatient(patientUsername, res);

  const appointment = await validateAppointment(appointmentId, res);

  const doctor = await validateDoctor(appointment.doctorUsername, res);
  const discount = getDiscountAmountForAppointments(
    patient.healthPackage.membership
  );
  const duration = appointment.endHour - appointment.startHour;
  const amount = duration * doctor.hourlyRate * (1 - discount);

  if (paymentMethod == "Wallet") {
    payWithWallet(patientUsername, appointmentId, res);
  } else if (paymentMethod == "Card") {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } else {
    res.status(404).json({ message: "Invalid payment method" });
  }
};

module.exports = { payAppointment };
