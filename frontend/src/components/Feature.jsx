import React from "react";

export function Feature({ title, description, imageSrc }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
      <img src={imageSrc} alt="" className="ml-auto" width={160} height={160} />
    </div>
  );
}
