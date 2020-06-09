#!/bin/bash

# Column names will be taken from fields.txt
mongoexport --db=Test --collection=TestData --type=csv --fieldFile=fields.txt --out=results.csv