class Response {
    constructor(participantID, variation, timeOpened, timeClosed, risk, confidence, ease) {
        this.participantID = (participantID == null)? null: participantID;
        this.variation = (variation == null)? null: parseInt(variation);
        this.timeOpened = (timeOpened == null)? null: timeOpened;
        this.timeClosed = (timeClosed == null)? null: timeClosed;
        this.risk = (risk == null)? null: risk;
        this.confidence = (confidence == null)? null: parseInt(confidence);
        this.ease = (ease == null)? null: parseInt(ease);
    }

    toObject() {
        return JSON.parse(JSON.stringify(this));
    }
}

module.exports = Response;