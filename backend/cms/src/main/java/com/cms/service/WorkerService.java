package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cms.entity.Worker;
import com.cms.repository.WorkerRepository;

@Service
public class WorkerService {

    @Autowired
    private WorkerRepository workerRepository;

    public Worker saveWorker(Worker worker) {
    	worker.setId(generateWorkerId());
        return workerRepository.save(worker);
    }

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    public Worker getWorkerById(String id) {
        return workerRepository.findById(id).orElse(null);
    }

    public Worker updateWorker(String id, Worker newWorker) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        worker.setName(newWorker.getName());
        worker.setRole(newWorker.getRole());
        worker.setPhone(newWorker.getPhone());
        worker.setWage(newWorker.getWage());
        worker.setProject(newWorker.getProject());
        worker.setStatus(newWorker.getStatus());

        return workerRepository.save(worker);
    }

    public void deleteWorker(String id) {
        workerRepository.deleteById(id);
    }
    private String generateWorkerId() {
        String id;

        do {
            id = "WRK-" + UUID.randomUUID()
                             .toString()
                             .substring(0, 8)
                             .toUpperCase();

        } while (workerRepository.existsById(id));

        return id;
    }
}
