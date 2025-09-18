import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import DatasetModalStyles from "./DatasetModal.module.css";
import useUI from "@/lib/hooks/useUI";
import { HEALTH_STATUS_OF_VEGETATION } from "@/lib/constants";

export const DEFAULT_DATASET = "defaultDataset";
export const PILOT_DATASET = "pilotDataset";
export const PILOT_ZONE1_DATASET = "pilotZone1Dataset";
export const PILOT_ZONE2_DATASET = "pilotZone2Dataset";
export const PILOT_ZONE3_DATASET = "pilotZone3Dataset";
export const PILOT_ZONE4_DATASET = "pilotZone4Dataset";

const PILOT_ZONES_DATASETS = [
  PILOT_ZONE1_DATASET,
  PILOT_ZONE2_DATASET,
  PILOT_ZONE3_DATASET,
  PILOT_ZONE4_DATASET
];

const DatasetModal = () => {
  const { activeBundle, selectedDataset, changeSelectedDataset } = useUI();
  const [dataset, setDataset] = useState(selectedDataset);
  const [open, setOpen] = useState(true);

  const handleChange = (event) => {
    setDataset(event.target.value);
  };

  const handleOk = () => {
    changeSelectedDataset(dataset);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="dataset-dialog-title"
    >
      <DialogTitle id="dataset-dialog-title">
        Choose dataset to view:
      </DialogTitle>
      <DialogContent className={DatasetModalStyles.dialogContent}>
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="dataset"
            name="dataset"
            value={dataset}
            onChange={handleChange}
          >
            <FormControlLabel
              value={DEFAULT_DATASET}
              control={<Radio />}
              label="Default Dataset"
              className={DatasetModalStyles.radioOption}
            />
            {
              activeBundle === HEALTH_STATUS_OF_VEGETATION ? (
                <>
                  <FormControlLabel
                    value={PILOT_ZONE1_DATASET}
                    control={<Radio />}
                    label="Pilot Dataset #1 (2024-07-18 Austrian summer data)"
                    className={DatasetModalStyles.radioOption}
                  />
                  <FormControlLabel
                    value={PILOT_ZONE2_DATASET}
                    control={<Radio />}
                    label="Pilot Dataset #2 (2025-02-25 Austrian leafless season data)"
                    className={DatasetModalStyles.radioOption}
                  />
                  <FormControlLabel
                    value={PILOT_ZONE3_DATASET}
                    control={<Radio />}
                    label="Pilot Dataset #3 (2024-11-15 Austrian autumn/leafless season data)"
                    className={DatasetModalStyles.radioOption}
                  />
                  <FormControlLabel
                    value={PILOT_ZONE4_DATASET}
                    control={<Radio />}
                    label="Pilot Dataset #4"
                    className={DatasetModalStyles.radioOption}
                  />
                </>
              ) : (
                <FormControlLabel
                  value={PILOT_DATASET}
                  control={<Radio />}
                  label="Pilot Dataset"
                  className={DatasetModalStyles.radioOption}
                />
              )
            }
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions className={DatasetModalStyles.dialogActions}>
        <Button onClick={handleOk} variant="contained" color="primary" className={DatasetModalStyles.okButton}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DatasetModal;
