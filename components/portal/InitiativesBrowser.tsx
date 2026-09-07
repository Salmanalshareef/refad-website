"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import { cn } from "@/lib/utils";
import type { Initiative, InitiativeType } from "@/types/db";

const cardWidth = "w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]";

export function InitiativesBrowser({
  types,
  initiatives,
}: {
  types: InitiativeType[];
  initiatives: Initiative[];
}) {
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [viewingInitiativeId, setViewingInitiativeId] = useState<string | null>(null);

  function handleSelectType(id: string) {
    setSelectedTypeId((current) => (current === id ? null : id));
    setViewingInitiativeId(null);
  }

  const subServices = selectedTypeId
    ? initiatives.filter((i) => i.initiative_type_id === selectedTypeId && i.is_requestable)
    : [];

  const viewingInitiative = initiatives.find((i) => i.id === viewingInitiativeId) ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold text-primary-900">اختر مبادرة</h2>
        {types.length === 0 ? (
          <EmptyState message="لا توجد مبادرات متاحة حاليًا." />
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {types.map((type) => {
              const isSelected = type.id === selectedTypeId;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectType(type.id)}
                  className={cn(
                    cardWidth,
                    "rounded-2xl border bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                    isSelected ? "border-primary-500 ring-1 ring-primary-500" : "border-neutral-200"
                  )}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <InitiativeIcon src={type.icon} size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-primary-900">{type.title}</h3>
                  {type.description && (
                    <p className="mt-2 text-sm text-neutral-600">{type.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedTypeId && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-primary-900">اختر خدمة فرعية</h2>
          {subServices.length === 0 ? (
            <EmptyState message="لا توجد خدمات فرعية متاحة لهذه المبادرة حاليًا." />
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {subServices.map((initiative) => {
                const isSelected = initiative.id === viewingInitiativeId;
                return (
                  <button
                    key={initiative.id}
                    type="button"
                    onClick={() => setViewingInitiativeId(initiative.id)}
                    className={cn(
                      cardWidth,
                      "rounded-2xl border bg-white p-6 text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                      isSelected ? "border-primary-500 ring-1 ring-primary-500" : "border-neutral-200"
                    )}
                  >
                    <h3 className="font-bold text-primary-900">{initiative.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{initiative.description}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewingInitiative && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="text-lg font-bold text-primary-900">{viewingInitiative.title}</h3>
          <p className="mt-2 text-sm text-neutral-700">{viewingInitiative.description}</p>
          {viewingInitiative.requirements && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-neutral-800">المتطلبات</p>
              <p className="mt-1 text-sm text-neutral-600">{viewingInitiative.requirements}</p>
            </div>
          )}
          <Link
            href="/portal/services/new-request"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            تقديم طلب جديد
          </Link>
        </div>
      )}
    </div>
  );
}
