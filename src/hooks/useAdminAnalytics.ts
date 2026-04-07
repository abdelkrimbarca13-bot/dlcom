import { useMemo } from 'react';

export type Intervention = {
  id: string;
  numeroDossier: string;
  dateCreation: string;
  articleType: string;
  isNonClos: boolean;
  userId: string;
  userName?: string;
};

type FilterParams = {
  startDate: string | null;
  endDate: string | null;
  employeeId: string | 'all';
  articleType: string | 'all';
  onlyNonClos?: boolean;
};

export function useAdminAnalytics(interventions: Intervention[], filters: FilterParams) {
  const filteredData = useMemo(() => {
    return interventions.filter((item) => {
      const itemDate = new Date(item.dateCreation);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      let end = filters.endDate ? new Date(filters.endDate) : null;

      if (end) {
        // Set end date to the very end of that day (23:59:59.999)
        end.setHours(23, 59, 59, 999);
      }

      const isWithinDateRange =
        (!start || itemDate >= start) &&
        (!end || itemDate <= end);
      
      const isMatchingEmployee =
        filters.employeeId === 'all' || item.userId === filters.employeeId;
      
      const isMatchingArticleType =
        filters.articleType === 'all' || item.articleType === filters.articleType;

      const isMatchingNonClos = 
        !filters.onlyNonClos || item.isNonClos === true;

      return isWithinDateRange && isMatchingEmployee && isMatchingArticleType && isMatchingNonClos;
    });
  }, [interventions, filters]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    
    // Distribution par type d'article
    const articleTypeDistribution = filteredData.reduce((acc, item) => {
      acc[item.articleType] = (acc[item.articleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Nombre de dossiers non clos
    const nonClosCount = filteredData.filter(i => i.isNonClos).length;

    return {
      total,
      articleTypeDistribution,
      nonClosCount,
    };
  }, [filteredData]);

  return { filteredData, stats };
}
