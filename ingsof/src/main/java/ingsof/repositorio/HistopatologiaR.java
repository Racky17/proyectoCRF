package ingsof.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import ingsof.entidad.Histopatologia;

public interface HistopatologiaR extends JpaRepository<Histopatologia, Integer> {
}
