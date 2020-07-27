class Response {
    constructor(URL, participantID, order, timeOpened, timeClosed, risk, confidence, ease) {
        this.URL = (URL == null) ? null : URL;
        this.participantID = (participantID == null)? null: participantID;
        // this.variation = (variation == null)? null: parseInt(variation);
        this.order = (order == null)? null : parseInt(order);
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