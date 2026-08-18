export const issueTypesByCategory: Record<string, string[]> = {
  plumber: ["Leaking tap", "Blocked drain", "No water pressure", "Pipe installation", "Other"],
  electrician: ["Power outage", "MCB tripping", "Fan/light fitting", "Wiring issue", "Other"],
  carpenter: ["Door/window repair", "Furniture repair", "New furniture", "Modular fitting", "Other"],
  "ac-repair": ["AC not cooling", "Gas refill", "New installation", "Servicing", "Other"],
  hardware: ["Tool purchase", "Material supply", "General enquiry", "Other"],
  painter: ["Wall painting", "Waterproofing", "Touch-up work", "Other"],
  appliance: ["Washing machine", "Refrigerator", "Microwave", "Other"],
}

export function getIssueTypes(categoryId: string) {
  return issueTypesByCategory[categoryId] ?? ["General issue", "Installation", "Repair", "Other"]
}
