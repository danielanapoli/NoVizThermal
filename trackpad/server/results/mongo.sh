#!/bin/bash

# This script will get all the contents of the specified collection
# and output them in CSV format.
# Currently, the _id column (MongoDB's ids) are not included in the export

# Column names will be taken from fields.txt
mongoexport --db=Test --collection=TestData --type=csv --fieldFile=fields.txt --out=results.csv