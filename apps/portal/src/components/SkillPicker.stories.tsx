// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { http, HttpResponse } from "msw";
import type { SkillDocument } from "@/types";
import { setSelectedProjectIdHolder } from "@/lib/project-scope";
import { SkillPicker } from "./SkillPicker";

const skills = Array.from({ length: 13 }, (_, index) => ({
  _id: `azure/cosmos-kit/cosmos-${String(index + 1).padStart(2, "0")}`,
  name: `Cosmos DB skill ${index + 1}`,
  description: "Azure Cosmos DB agent guidance",
})) as SkillDocument[];

function SkillPickerHarness() {
  setSelectedProjectIdHolder("demo-project");
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="w-[44rem] max-w-full p-6">
      <SkillPicker selected={selected} onChange={setSelected} />
    </div>
  );
}

const meta = {
  component: SkillPicker,
  render: () => <SkillPickerHarness />,
  args: {
    selected: [],
    onChange: () => {},
  },
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/v1/skills", () => HttpResponse.json(skills)),
        http.get("*/api/v1/skills/search/external", () => HttpResponse.json([])),
        http.get("*/api/v1/skills/*/revisions", () => HttpResponse.json([])),
      ],
    },
  },
} satisfies Meta<typeof SkillPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiSelectSearch: Story = {
  play: async ({ canvas }) => {
    const input = await canvas.findByPlaceholderText("Search for skills…");
    await userEvent.type(input, "cosmos");
    await userEvent.click(await canvas.findByRole("button", { name: /cosmos-01/i }));

    await expect(input).toHaveValue("cosmos");
    await expect(canvas.getByRole("button", { name: /cosmos-02/i })).toBeVisible();
  },
};
