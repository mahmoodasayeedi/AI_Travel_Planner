import { Compass } from "lucide-react";
import { parseItinerary } from "../api";
import Itinerary from "./Itinerary";
import RichText from "./RichText";

export default function Message({ msg, image, onImage }) {
  if (msg.role === "user") {
    return (
      <div className="row user">
        <div className="bubble">{msg.content}</div>
      </div>
    );
  }
  const trip = parseItinerary(msg.content);
  return (
    <div className="row assistant">
      <div className="avatar" aria-hidden="true">
        <Compass size={18} />
      </div>
      <div className={trip ? "bubble wide" : "bubble"}>
        {trip ? <Itinerary data={trip} image={image} onImage={onImage} /> : <RichText text={msg.content} />}
      </div>
    </div>
  );
}
