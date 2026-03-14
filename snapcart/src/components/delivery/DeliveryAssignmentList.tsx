import React from "react";
import AssignmentCard from "../AssignmentCard";

type DeliveryAssignmentListProps = {
  assignments: any[];
  onAccept: () => void;
};

const DeliveryAssignmentList = ({
  assignments,
  onAccept,
}: DeliveryAssignmentListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment._id}
          assignment={assignment}
          onAccept={onAccept}
        />
      ))}
    </div>
  );
};

export default DeliveryAssignmentList;
