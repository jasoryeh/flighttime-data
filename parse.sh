#!/bin/bash

#Note: NASR_WEBSITE="https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/"
NASR_ACTIVE="https://nfdc.faa.gov/webContent/28DaySub/28DaySubscription_Effective_2023-02-23.zip"

mkdir -p tmp
cd tmp

# NASR Data
echo "Downloading $NASR_ACTIVE"
curl $NASR_ACTIVE -o nasr_active.zip
echo "Unzipping nasr_active.zip"
unzip nasr_active.zip -d nasr_active
echo "Processing files..."
npx shp2json nasr_active/Additional_Data/Shape_Files/Class_Airspace.shp -o Airspace.shp.json
npx dbf2json nasr_active/Additional_Data/Shape_Files/Class_Airspace.dbf -o Airspace.dbf.json

