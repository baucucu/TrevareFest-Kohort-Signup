import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { withRouter } from "react-router-dom";
import { useStateMachine } from "little-state-machine";
import updateAction from "./updateAction";
import { yupResolver } from "@hookform/resolvers/yup";
import "yup-phone";
import * as Yup from "yup";
var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keyYNFILTvHzPsq1B" }).base(
  "appw2hvpKRTQCbB4O"
);

const Step2 = (props) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    phone: Yup.string().phone().required("Phone is required"),
    kohort: Yup.string()
      .oneOf(["Kohort 1", "Kohort 2", null], "Kohort is required")
      .required("Kohort is required"),
    gdpr: Yup.bool().oneOf([true], "Accept GDPR is required")
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm(formOptions);
  // const { register, handleSubmit } = useForm();
  const { state, actions } = useStateMachine({ updateAction });

  const onSubmit = (data) => {
    console.log("data: ", data);
    actions.updateAction(data);
    reset();
    saveKohortData(data, state);
  };

  async function saveKohortData(data, state) {
    base("Directory: Kohort Signups").update(
      [
        {
          id: state.recordId,
          fields: {
            Name: data.name,
            Phone: data.phone,
            Kohort: [
              state.kohorts.filter((kohort) => kohort.name === data.kohort)[0]
                ?.id
            ],
            GDPR: data.gdpr,
            "Completed?": true
          }
        }
      ],
      function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function (record) {
          console.log("record updated: ", record.get("Code"));
          props.history.push("./code/" + record.get("Code"));
        });
      }
    );
  }

  async function getKohorts() {
    base("Directory: Kohorts")
      .select({
        view: state.email ? "Available" : "Crew"
      })
      .firstPage(function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
        actions.updateAction({
          kohorts: records.map((record) => {
            return { id: record.id, name: record.fields.Name };
          })
        });
      });
  }

  useEffect(() => {
    getKohorts();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>Name of ticket holder</label>
      <input
        type="text"
        placeholder="Enter your name"
        // defaultValue={state.name}
        {...register("name", {
          required: true,
          maxLength: 80
        })}
      />
      {errors.name && <p>Name is required</p>}
      <label>Phone number</label>
      <input
        type="tel"
        placeholder="Enter your phone number"
        {...register("phone", {
          required: true,
          minLength: 6,
          maxLength: 12
        })}
      />
      {errors.phone && <p>Phone is required</p>}
      <label>Kohort</label>
      <select {...register("kohort", { required: true })}>
        <option value={null}></option>
        {state?.kohorts &&
          state.kohorts.map((kohort) => {
            return (
              <option key={kohort.id} value={kohort.name}>
                {kohort.name}
              </option>
            );
          })}
        {/* <option value="Kohort 1">Kohort 1</option>
        <option value="Kohort 2">Kohort 2</option> */}
      </select>
      {errors.kohort && <p>Kohort is required</p>}
      <label>GDPR agreement</label>
      <input
        style={{ display: "flex", marginTop: 20 }}
        type="checkbox"
        placeholder="GDPR agreement"
        {...register("gdpr", {})}
      />
      {errors.gdpr && <p>GDPR agreement is required</p>}
      <input type="submit" />
    </form>
  );
};

export default withRouter(Step2);
