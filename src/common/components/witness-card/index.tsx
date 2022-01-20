import React from "react";
import WitnessVoteBtn from "../witness-vote-btn";

export const WitnessCard = (props:any) => {
  return (
    <div className="p-3 mb-3 border rounded">
      <div>
            <div><b>Rank: 1</b></div>
                
            <div>
                {WitnessVoteBtn({
                ...props,
                voted: witnessVotes.includes(row.name),
                witness: row.name,
                onSuccess: (approve) => {
                        if (approve) {
                            this.addWitness(row.name);
                        } else {
                            this.deleteWitness(row.name);
                        }
                    }
                })}
            </div>
        </div>
      <div className="d-flex align-items-center">
        <div>
            <img src="https://images.ecency.com/webp/u/blocktrades/avatar/medium" alt="" className="rounded-circle avatar"/>
        </div>
        <div>Blockchain</div>
      </div>
      <div><b>Miss: 1231</b> window-icon</div>
      <div><b>Fee: 1231</b></div>
      <div><b>Feed: 1231</b></div>
      <div><b>version: 1231</b></div>
    </div>
  );
};
