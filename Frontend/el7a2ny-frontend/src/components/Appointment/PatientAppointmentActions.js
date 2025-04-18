import { useContext, useState } from "react";
import ChecklistIcon from "src/icons/untitled-ui/duocolor/ChecklistIcon";
import RescheduleIcon from "src/icons/untitled-ui/duocolor/RescheduleIcon";
import CancelIcon from "src/icons/untitled-ui/duocolor/CancelIcon";
import { TableContext } from "../Table/Table";
import Icon from "../Icon";
import { BACKEND_ROUTE } from "src/utils/Constants";
import { PATCH } from "src/utils/helper-functions";
import ReschedulePopUp from "../ReschedulePopUp";
import Cookies from "js-cookie";

function PatientAppointmentActions({ appointment }) {
  const { setShowError, setError, setAllData } = useContext(TableContext);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);

  const username = Cookies.get("username");
  async function handleRequestFollowUp(appointmentId) {
    PATCH({
      url: `${BACKEND_ROUTE}/patients/${username}/appointments/${appointmentId}`,
      body: { status: "follow-up Requested" },
      setShowError,
      setError,
      updater: () => {
        setAllData((prev) =>
          prev.map((item) => {
            if (item._id !== appointmentId) return item;
            return { ...item, status: "follow-up Requested" };
          })
        );
      },
    });
  }

  async function handleCancelAppointment(appointmentId) {
    PATCH({
      url: `${BACKEND_ROUTE}/patients/${username}/appointments/${appointmentId}/cancel`,
      setLoading,
      setShowError,
      setError,
      updater: () => {
        setAllData((prev) =>
          prev.map((item) => {
            if (item._id !== appointmentId) return item;
            return { ...item, status: "cancelled" };
          })
        );
      },
    });
  }

  return (
    <>
      <Icon
        title="Request Follow-up"
        disabled={!(appointment.status == "completed")}
        onClick={() => {
          handleRequestFollowUp(appointment._id);
        }}
      >
        <ChecklistIcon />
      </Icon>
      <Icon
        disabled={!(appointment.status === "upcoming" || appointment.status === "rescheduled")}
        title="Reschedule Appointment"
        onClick={() => {
          setRescheduling(true);
        }}
      >
        <RescheduleIcon />
      </Icon>
      <Icon
        title="Cancel Appointment"
        onClick={() => {
          handleCancelAppointment(appointment._id);
        }}
      >
        <CancelIcon />
      </Icon>
      <ReschedulePopUp
        appointment={appointment}
        getUrl={`${BACKEND_ROUTE}/patients/${username}/doctors/${appointment.doctorUsername}/appointments`}
        patchUrl={`${BACKEND_ROUTE}/patients/${username}/appointments`}
        loading={loading}
        setLoading={setLoading}
        rescheduling={rescheduling}
        setRescheduling={setRescheduling}
      />
    </>
  );
}

export default PatientAppointmentActions;
